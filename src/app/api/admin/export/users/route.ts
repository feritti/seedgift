import { requireAdminSession } from "@/lib/admin";
import { createServerClient } from "@/lib/db";
import { toCsv, csvResponse, csvDateStamp } from "@/lib/csv";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireAdminSession();
  const db = createServerClient();

  const { data } = await db
    .from("users")
    .select("id, email, name, stripe_account_id, stripe_onboarded, created_at")
    .order("created_at", { ascending: false });

  type Row = {
    id: string;
    email: string;
    name: string | null;
    stripe_account_id: string | null;
    stripe_onboarded: boolean;
    created_at: string;
  };
  const rows = (data ?? []) as Row[];

  const csv = toCsv<Row>(rows, [
    { header: "id", get: (r) => r.id },
    { header: "email", get: (r) => r.email },
    { header: "name", get: (r) => r.name },
    { header: "stripe_account_id", get: (r) => r.stripe_account_id },
    { header: "stripe_onboarded", get: (r) => r.stripe_onboarded },
    { header: "created_at", get: (r) => r.created_at },
  ]);

  await db.from("admin_audit").insert({
    admin_email: session.user.email,
    action: "export_users",
    metadata: { row_count: rows.length },
  });

  return csvResponse(csv, `seedgift-users-${csvDateStamp()}.csv`);
}
