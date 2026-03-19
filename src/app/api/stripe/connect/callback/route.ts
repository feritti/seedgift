import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { createServerClient } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL));
  }

  const db = createServerClient();

  // Get user's Stripe account ID
  const { data: user } = await db
    .from("users")
    .select("id, stripe_account_id")
    .eq("email", session.user.email)
    .single();

  if (user?.stripe_account_id) {
    // Check if onboarding is complete
    const stripe = getStripe();
    const account = await stripe.accounts.retrieve(user.stripe_account_id);

    if (account.charges_enabled) {
      await db
        .from("users")
        .update({ stripe_onboarded: true })
        .eq("id", user.id);
    }
  }

  return NextResponse.redirect(new URL("/settings", process.env.NEXT_PUBLIC_APP_URL));
}
