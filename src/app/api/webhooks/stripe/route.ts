import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createServerClient } from "@/lib/db";
import {
  sendGiftReceipt,
  sendNewGiftNotification,
  sendSentGiftReceipt,
  sendSentGiftNotification,
} from "@/lib/email";
import {
  calculateGrowth,
  formatCurrency,
} from "@/shared/utils/growth-calculator";
import { getFundByTicker } from "@/shared/constants/funds";

const CLAIM_PROJECTION_YEARS = 18;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  const stripe = getStripe();
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const kind = session.metadata?.kind;

    if (kind === "sent_gift") {
      await handleSentGiftCompleted(session);
    } else {
      // Existing gift-page donation flow (kind is undefined for legacy sessions)
      await handleGiftPageDonationCompleted(session);
    }
  }

  return NextResponse.json({ received: true });
}

async function handleGiftPageDonationCompleted(
  session: import("stripe").Stripe.Checkout.Session
) {
  const giftId = session.metadata?.gift_id;
  if (!giftId) return;

  const db = createServerClient();

  await db
    .from("gifts")
    .update({
      status: "completed",
      stripe_payment_id: session.payment_intent as string,
    })
    .eq("id", giftId);

  const giverEmail = session.metadata?.giver_email;
  const giverName = session.metadata?.giver_name;

  if (giverEmail) {
    await db.from("giver_emails").upsert(
      {
        email: giverEmail,
        name: giverName,
        first_gift_at: new Date().toISOString(),
        gift_count: 1,
      },
      { onConflict: "email" }
    );
  }

  // Transactional emails (non-blocking)
  try {
    const { data: gift } = await db
      .from("gifts")
      .select("amount_cents, note, gift_page_id")
      .eq("id", giftId)
      .single();

    if (!gift) return;

    const { data: giftPage } = await db
      .from("gift_pages")
      .select("child_name, event_name, fund_ticker, fund_name, user_id")
      .eq("id", gift.gift_page_id)
      .single();

    if (!giftPage) return;

    const amount = formatCurrency(gift.amount_cents / 100);

    if (giverEmail && giverName) {
      await sendGiftReceipt({
        giverEmail,
        giverName,
        childName: giftPage.child_name,
        eventName: giftPage.event_name,
        amount,
        fundName: giftPage.fund_name,
      });
    }

    const { data: parent } = await db
      .from("users")
      .select("email, name")
      .eq("id", giftPage.user_id)
      .single();

    if (parent?.email) {
      await sendNewGiftNotification({
        parentEmail: parent.email,
        parentName: parent.name || "there",
        giverName: giverName || "Someone",
        childName: giftPage.child_name,
        amount,
        note: gift.note,
      });
    }
  } catch {
    console.error("Failed to send transactional emails for gift:", giftId);
  }
}

async function handleSentGiftCompleted(
  session: import("stripe").Stripe.Checkout.Session
) {
  const sentGiftId = session.metadata?.sent_gift_id;
  if (!sentGiftId) return;

  const db = createServerClient();

  await db
    .from("sent_gifts")
    .update({
      status: "completed",
      stripe_payment_id: session.payment_intent as string,
    })
    .eq("id", sentGiftId);

  const giverEmail = session.metadata?.giver_email;
  const giverName = session.metadata?.giver_name;

  if (giverEmail) {
    await db.from("giver_emails").upsert(
      {
        email: giverEmail,
        name: giverName,
        first_gift_at: new Date().toISOString(),
        gift_count: 1,
      },
      { onConflict: "email" }
    );
  }

  // Transactional emails (non-blocking)
  try {
    const { data: sentGift } = await db
      .from("sent_gifts")
      .select(
        "slug, child_name, occasion, amount_cents, fund_ticker, fund_name, message, recipient_email"
      )
      .eq("id", sentGiftId)
      .single();

    if (!sentGift) return;

    const amountDollars = sentGift.amount_cents / 100;
    const amount = formatCurrency(amountDollars);
    const fund = getFundByTicker(sentGift.fund_ticker);
    const projectedValue = fund
      ? formatCurrency(
          calculateGrowth(amountDollars, fund.avgAnnualReturn, CLAIM_PROJECTION_YEARS)
        )
      : amount;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
    const shareUrl = `${appUrl}/g/${sentGift.slug}`;

    if (giverEmail && giverName) {
      await sendSentGiftReceipt({
        giverEmail,
        giverName,
        childName: sentGift.child_name,
        occasion: sentGift.occasion,
        amount,
        fundName: sentGift.fund_name,
        recipientEmail: sentGift.recipient_email,
        shareUrl,
        projectedValue,
      });
    }

    await sendSentGiftNotification({
      recipientEmail: sentGift.recipient_email,
      giverName: giverName || "Someone",
      childName: sentGift.child_name,
      occasion: sentGift.occasion,
      amount,
      fundName: sentGift.fund_name,
      message: sentGift.message,
      shareUrl,
      projectedValue,
    });
  } catch {
    console.error("Failed to send transactional emails for sent gift:", sentGiftId);
  }
}
