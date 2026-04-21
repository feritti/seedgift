import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createServerClient } from "@/lib/db";
import { getFundByTicker } from "@/shared/constants/funds";
import { isValidOccasion } from "@/shared/constants/occasions";
import { generateSentGiftSlug } from "@/lib/actions/sent-gifts";
import Stripe from "stripe";

// Simple in-memory rate limiter (per IP, 10 requests per minute) — mirrors
// the pattern used in /api/checkout and /api/contact on this codebase.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_AMOUNT_CENTS = 100; // $1.00
const MAX_AMOUNT_CENTS = 1_000_000; // $10,000.00
const MAX_NAME_LENGTH = 100;
const MAX_MESSAGE_LENGTH = 500;

export async function POST(request: NextRequest) {
  // Rate limiting
  const ip =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  // Origin check (CSRF protection)
  const origin = request.headers.get("origin");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const allowedOrigins = [appUrl, appUrl.replace("://www.", "://")];
  if (!origin || !allowedOrigins.includes(origin)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const {
    giverName,
    giverEmail,
    recipientEmail,
    recipientName,
    childName,
    occasion,
    amountCents,
    fundTicker,
    message,
  } = body;

  // Required fields
  if (
    !giverName ||
    !giverEmail ||
    !recipientEmail ||
    !childName ||
    !occasion ||
    !fundTicker ||
    !amountCents
  ) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  // Giver name
  if (
    typeof giverName !== "string" ||
    giverName.trim().length < 1 ||
    giverName.length > MAX_NAME_LENGTH
  ) {
    return NextResponse.json(
      { error: `Your name must be 1-${MAX_NAME_LENGTH} characters` },
      { status: 400 }
    );
  }

  // Child name
  if (
    typeof childName !== "string" ||
    childName.trim().length < 1 ||
    childName.length > MAX_NAME_LENGTH
  ) {
    return NextResponse.json(
      { error: `Child's name must be 1-${MAX_NAME_LENGTH} characters` },
      { status: 400 }
    );
  }

  // Emails
  if (
    typeof giverEmail !== "string" ||
    !EMAIL_REGEX.test(giverEmail) ||
    giverEmail.length > 254
  ) {
    return NextResponse.json(
      { error: "Invalid giver email" },
      { status: 400 }
    );
  }
  if (
    typeof recipientEmail !== "string" ||
    !EMAIL_REGEX.test(recipientEmail) ||
    recipientEmail.length > 254
  ) {
    return NextResponse.json(
      { error: "Invalid recipient email" },
      { status: 400 }
    );
  }

  // Recipient name (optional)
  if (recipientName !== undefined && recipientName !== null && recipientName !== "") {
    if (
      typeof recipientName !== "string" ||
      recipientName.length > MAX_NAME_LENGTH
    ) {
      return NextResponse.json(
        { error: `Recipient name must be under ${MAX_NAME_LENGTH} characters` },
        { status: 400 }
      );
    }
  }

  // Occasion
  if (typeof occasion !== "string" || !isValidOccasion(occasion)) {
    return NextResponse.json({ error: "Invalid occasion" }, { status: 400 });
  }

  // Amount
  if (typeof amountCents !== "number" || !Number.isInteger(amountCents)) {
    return NextResponse.json(
      { error: "Amount must be a whole number" },
      { status: 400 }
    );
  }
  if (amountCents < MIN_AMOUNT_CENTS || amountCents > MAX_AMOUNT_CENTS) {
    return NextResponse.json(
      {
        error: `Amount must be between $${MIN_AMOUNT_CENTS / 100} and $${
          MAX_AMOUNT_CENTS / 100
        }`,
      },
      { status: 400 }
    );
  }

  // Fund
  const fund = typeof fundTicker === "string" ? getFundByTicker(fundTicker) : undefined;
  if (!fund) {
    return NextResponse.json({ error: "Invalid fund" }, { status: 400 });
  }

  // Message (optional)
  if (message !== undefined && message !== null && message !== "") {
    if (typeof message !== "string" || message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: `Message must be under ${MAX_MESSAGE_LENGTH} characters` },
        { status: 400 }
      );
    }
  }

  // Sanitize
  const sanitizedGiverName = giverName.trim();
  const sanitizedGiverEmail = giverEmail.trim().toLowerCase();
  const sanitizedRecipientEmail = recipientEmail.trim().toLowerCase();
  const sanitizedRecipientName =
    recipientName && typeof recipientName === "string"
      ? recipientName.trim() || null
      : null;
  const sanitizedChildName = childName.trim();
  const sanitizedMessage =
    message && typeof message === "string" ? message.trim() || null : null;

  const db = createServerClient();

  // Generate a unique slug (retry on collision up to 5 times)
  let slug = generateSentGiftSlug(sanitizedChildName, occasion);
  let sentGiftId: string | null = null;
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data, error } = await db
      .from("sent_gifts")
      .insert({
        slug,
        giver_name: sanitizedGiverName,
        giver_email: sanitizedGiverEmail,
        recipient_email: sanitizedRecipientEmail,
        recipient_name: sanitizedRecipientName,
        child_name: sanitizedChildName,
        occasion,
        amount_cents: amountCents,
        fund_ticker: fund.ticker,
        fund_name: fund.name,
        message: sanitizedMessage,
      })
      .select("id")
      .single();

    if (!error && data) {
      sentGiftId = data.id;
      break;
    }

    // Unique violation on slug — regenerate and retry
    if (error && error.code === "23505") {
      slug = generateSentGiftSlug(sanitizedChildName, occasion);
      continue;
    }

    // Other error — bail
    return NextResponse.json(
      { error: "Failed to create gift" },
      { status: 500 }
    );
  }

  if (!sentGiftId) {
    return NextResponse.json(
      { error: "Could not generate a unique gift link. Please try again." },
      { status: 500 }
    );
  }

  const stripe = getStripe();

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `SeedGift for ${sanitizedChildName}'s ${occasion}`,
            description: `Invested in ${fund.ticker} (${fund.name})`,
          },
          unit_amount: amountCents,
        },
        quantity: 1,
      },
    ],
    metadata: {
      kind: "sent_gift",
      sent_gift_id: sentGiftId,
      giver_email: sanitizedGiverEmail,
      giver_name: sanitizedGiverName,
      recipient_email: sanitizedRecipientEmail,
    },
    customer_email: sanitizedGiverEmail,
    success_url: `${appUrl}/send-gift/${slug}/sent`,
    cancel_url: `${appUrl}/send-gift`,
  };

  try {
    const session = await stripe.checkout.sessions.create(sessionParams);
    return NextResponse.json({ url: session.url });
  } catch {
    // Clean up the sent_gifts row if Stripe fails
    await db.from("sent_gifts").delete().eq("id", sentGiftId);
    return NextResponse.json(
      { error: "Payment service error. Please try again." },
      { status: 500 }
    );
  }
}
