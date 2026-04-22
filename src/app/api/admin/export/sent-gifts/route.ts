import { requireAdminSession } from "@/lib/admin";
import { createServerClient } from "@/lib/db";
import { toCsv, csvResponse, csvDateStamp } from "@/lib/csv";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireAdminSession();
  const db = createServerClient();

  const { data } = await db
    .from("sent_gifts")
    .select(
      "id, slug, giver_name, giver_email, recipient_email, recipient_name, child_name, occasion, amount_cents, fund_ticker, fund_name, message, stripe_payment_id, status, claimed_by_user_id, claimed_at, fund_ticker_final, paid_out_at, created_at"
    )
    .order("created_at", { ascending: false });

  type Row = {
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
    status: string;
    claimed_by_user_id: string | null;
    claimed_at: string | null;
    fund_ticker_final: string | null;
    paid_out_at: string | null;
    created_at: string;
  };
  const rows = (data ?? []) as Row[];

  const csv = toCsv<Row>(rows, [
    { header: "id", get: (r) => r.id },
    { header: "slug", get: (r) => r.slug },
    { header: "giver_name", get: (r) => r.giver_name },
    { header: "giver_email", get: (r) => r.giver_email },
    { header: "recipient_email", get: (r) => r.recipient_email },
    { header: "recipient_name", get: (r) => r.recipient_name },
    { header: "child_name", get: (r) => r.child_name },
    { header: "occasion", get: (r) => r.occasion },
    { header: "amount_cents", get: (r) => r.amount_cents },
    { header: "fund_ticker", get: (r) => r.fund_ticker },
    { header: "fund_name", get: (r) => r.fund_name },
    { header: "message", get: (r) => r.message },
    { header: "status", get: (r) => r.status },
    { header: "stripe_payment_id", get: (r) => r.stripe_payment_id },
    { header: "claimed_by_user_id", get: (r) => r.claimed_by_user_id },
    { header: "claimed_at", get: (r) => r.claimed_at },
    { header: "fund_ticker_final", get: (r) => r.fund_ticker_final },
    { header: "paid_out_at", get: (r) => r.paid_out_at },
    { header: "created_at", get: (r) => r.created_at },
  ]);

  await db.from("admin_audit").insert({
    admin_email: session.user.email,
    action: "export_sent_gifts",
    metadata: { row_count: rows.length },
  });

  return csvResponse(csv, `seedgift-sent-gifts-${csvDateStamp()}.csv`);
}
