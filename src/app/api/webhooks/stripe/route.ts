import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createServerClient } from "@/lib/db";
import { sendGiftReceipt, sendNewGiftNotification } from "@/lib/email";
import { formatCurrency } from "@/shared/utils/growth-calculator";

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
    const giftId = session.metadata?.gift_id;

    if (giftId) {
      const db = createServerClient();

      // Update gift status
      await db
        .from("gifts")
        .update({
          status: "completed",
          stripe_payment_id: session.payment_intent as string,
        })
        .eq("id", giftId);

      // Upsert giver email for marketing list
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
          {
            onConflict: "email",
          }
        );
      }

      // Send transactional emails (non-blocking — don't fail the webhook)
      try {
        const { data: gift } = await db
          .from("gifts")
          .select("amount_cents, note, gift_page_id")
          .eq("id", giftId)
          .single();

        if (gift) {
          const { data: giftPage } = await db
            .from("gift_pages")
            .select("child_name, event_name, fund_ticker, fund_name, user_id")
            .eq("id", gift.gift_page_id)
            .single();

          if (giftPage) {
            const amount = formatCurrency(gift.amount_cents / 100);

            // Send receipt to giver
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

            // Send notification to parent
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
          }
        }
      } catch {
        // Email failures should not break the webhook
        console.error("Failed to send transactional emails for gift:", giftId);
      }
    }
  }

  return NextResponse.json({ received: true });
}
