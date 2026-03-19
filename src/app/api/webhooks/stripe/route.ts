import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createServerClient } from "@/lib/db";

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
    }
  }

  return NextResponse.json({ received: true });
}
