import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createServerClient } from "@/lib/db";
import Stripe from "stripe";

// Simple in-memory rate limiter (per IP, 10 requests per minute)
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

// Validation helpers
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_AMOUNT_CENTS = 100; // $1.00
const MAX_AMOUNT_CENTS = 1_000_000; // $10,000.00

export async function POST(request: NextRequest) {
  // Rate limiting
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
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

  const { giftPageId, amountCents, tipCents, giverName, giverEmail, note } = body;

  // Validate required fields exist and are correct types
  if (!giftPageId || !amountCents || !giverName || !giverEmail) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Validate gift page ID is a valid UUID
  if (typeof giftPageId !== "string" || !UUID_REGEX.test(giftPageId)) {
    return NextResponse.json({ error: "Invalid gift page ID" }, { status: 400 });
  }

  // Validate amount is a positive integer within range
  if (typeof amountCents !== "number" || !Number.isInteger(amountCents)) {
    return NextResponse.json({ error: "Amount must be a whole number" }, { status: 400 });
  }
  if (amountCents < MIN_AMOUNT_CENTS || amountCents > MAX_AMOUNT_CENTS) {
    return NextResponse.json(
      { error: `Amount must be between $${MIN_AMOUNT_CENTS / 100} and $${MAX_AMOUNT_CENTS / 100}` },
      { status: 400 }
    );
  }

  // Validate giver name
  if (typeof giverName !== "string" || giverName.trim().length < 1 || giverName.length > 100) {
    return NextResponse.json({ error: "Name must be 1-100 characters" }, { status: 400 });
  }

  // Validate giver email
  if (typeof giverEmail !== "string" || !EMAIL_REGEX.test(giverEmail) || giverEmail.length > 254) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  // Validate optional note
  if (note !== undefined && note !== null) {
    if (typeof note !== "string" || note.length > 500) {
      return NextResponse.json({ error: "Note must be under 500 characters" }, { status: 400 });
    }
  }

  // Validate optional tip
  const validatedTipCents = typeof tipCents === "number" && Number.isInteger(tipCents) && tipCents >= 0 && tipCents <= 1_000_000
    ? tipCents
    : 0;

  // Sanitize inputs
  const sanitizedName = giverName.trim();
  const sanitizedEmail = giverEmail.trim().toLowerCase();
  const sanitizedNote = note ? note.trim() : null;

  const db = createServerClient();

  // Get the gift page and its owner's Stripe account
  const { data: giftPage } = await db
    .from("gift_pages")
    .select("*, users!inner(stripe_account_id, stripe_onboarded)")
    .eq("id", giftPageId)
    .eq("status", "active")
    .single();

  if (!giftPage) {
    return NextResponse.json({ error: "Gift page not found" }, { status: 404 });
  }

  // Create the gift record
  const { data: gift, error: giftError } = await db
    .from("gifts")
    .insert({
      gift_page_id: giftPageId,
      amount_cents: amountCents,
      giver_name: sanitizedName,
      giver_email: sanitizedEmail,
      note: sanitizedNote,
    })
    .select()
    .single();

  if (giftError || !gift) {
    return NextResponse.json({ error: "Failed to create gift" }, { status: 500 });
  }

  const stripe = getStripe();

  // Build line items
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
    {
      price_data: {
        currency: "usd",
        product_data: {
          name: `Gift for ${giftPage.child_name}'s ${giftPage.event_name}`,
          description: `Invested in ${giftPage.fund_ticker} (${giftPage.fund_name})`,
        },
        unit_amount: amountCents,
      },
      quantity: 1,
    },
  ];

  // Add tip as a separate line item (stays with SeedGift)
  if (validatedTipCents > 0) {
    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: "Tip for SeedGift",
          description: "Optional tip to support the SeedGift platform",
        },
        unit_amount: validatedTipCents,
      },
      quantity: 1,
    });
  }

  // Build checkout session params
  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: "payment",
    line_items: lineItems,
    metadata: {
      gift_id: gift.id,
      giver_email: sanitizedEmail,
      giver_name: sanitizedName,
      tip_cents: String(validatedTipCents),
    },
    customer_email: sanitizedEmail,
    success_url: `${appUrl}/gift/${giftPage.slug}/thanks?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/gift/${giftPage.slug}`,
  };

  // If the parent has Stripe Connect, transfer only the gift amount (not the tip)
  const parentStripeAccount = giftPage.users?.stripe_account_id;
  if (parentStripeAccount && giftPage.users?.stripe_onboarded) {
    sessionParams.payment_intent_data = {
      transfer_data: {
        amount: amountCents, // Only the gift amount goes to the parent
        destination: parentStripeAccount,
      },
    };
  }

  try {
    const session = await stripe.checkout.sessions.create(sessionParams);
    return NextResponse.json({ url: session.url });
  } catch {
    // Clean up the gift record if Stripe fails
    await db.from("gifts").delete().eq("id", gift.id);
    return NextResponse.json({ error: "Payment service error. Please try again." }, { status: 500 });
  }
}
