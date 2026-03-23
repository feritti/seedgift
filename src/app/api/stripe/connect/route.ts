import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { createServerClient } from "@/lib/db";

export async function POST(request: NextRequest) {
  // Origin check (CSRF protection)
  const origin = request.headers.get("origin");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
  if (origin && origin !== appUrl) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = createServerClient();
  const stripe = getStripe();

  // Get user from database
  const { data: user } = await db
    .from("users")
    .select("id, stripe_account_id")
    .eq("email", session.user.email)
    .single();

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  let stripeAccountId = user.stripe_account_id;

  // Create a Stripe Connect account if one doesn't exist
  if (!stripeAccountId) {
    const account = await stripe.accounts.create({
      type: "express",
      email: session.user.email,
      business_type: "individual",
      capabilities: {
        transfers: { requested: true },
      },
    });
    stripeAccountId = account.id;

    await db
      .from("users")
      .update({ stripe_account_id: stripeAccountId })
      .eq("id", user.id);
  }

  // Create an onboarding link
  const accountLink = await stripe.accountLinks.create({
    account: stripeAccountId,
    refresh_url: `${appUrl}/settings`,
    return_url: `${appUrl}/api/stripe/connect/callback`,
    type: "account_onboarding",
  });

  return NextResponse.json({ url: accountLink.url });
}
