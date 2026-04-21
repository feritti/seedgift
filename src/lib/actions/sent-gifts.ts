import { createServerClient } from "@/lib/db";
import type { SentGift } from "@/shared/types/sent-gift";

/**
 * Generate a URL-safe slug from child name + occasion + a 6-char random suffix.
 * Example: "alice-birthday-a1b2c3"
 */
export function generateSentGiftSlug(
  childName: string,
  occasion: string
): string {
  const base = `${childName}-${occasion}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const suffix = Math.random().toString(36).substring(2, 8);
  return `${base}-${suffix}`;
}

type SentGiftRow = {
  id: string;
  slug: string;
  giver_name: string;
  giver_email: string;
  recipient_email: string;
  recipient_name: string | null;
  child_name: string;
  occasion: string;
  amount_cents: number;
  fund_ticker: string;
  fund_name: string;
  message: string | null;
  stripe_payment_id: string | null;
  status: SentGift["status"];
  claimed_by_user_id: string | null;
  claimed_at: string | null;
  fund_ticker_final: string | null;
  paid_out_at: string | null;
  created_at: string;
};

function mapRow(row: SentGiftRow): SentGift {
  return {
    id: row.id,
    slug: row.slug,
    giverName: row.giver_name,
    giverEmail: row.giver_email,
    recipientEmail: row.recipient_email,
    recipientName: row.recipient_name,
    childName: row.child_name,
    occasion: row.occasion,
    amountCents: row.amount_cents,
    fundTicker: row.fund_ticker,
    fundName: row.fund_name,
    message: row.message,
    stripePaymentId: row.stripe_payment_id,
    status: row.status,
    claimedByUserId: row.claimed_by_user_id,
    claimedAt: row.claimed_at,
    fundTickerFinal: row.fund_ticker_final,
    paidOutAt: row.paid_out_at,
    createdAt: row.created_at,
  };
}

export async function getSentGiftBySlug(slug: string): Promise<SentGift | null> {
  const db = createServerClient();
  const { data } = await db
    .from("sent_gifts")
    .select("*")
    .eq("slug", slug)
    .single();
  return data ? mapRow(data as SentGiftRow) : null;
}
