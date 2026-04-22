import { requireAdminSession } from "@/lib/admin";
import { createServerClient } from "@/lib/db";
import { toCsv, csvResponse, csvDateStamp } from "@/lib/csv";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireAdminSession();
  const db = createServerClient();

  const { data } = await db
    .from("gifts")
    .select(
      "id, gift_page_id, amount_cents, giver_name, giver_email, note, stripe_payment_id, status, thanked, created_at"
    )
    .order("created_at", { ascending: false });

  type RawGift = {
    id: string;
    gift_page_id: string;
    amount_cents: number;
    giver_name: string;
    giver_email: string;
    note: string | null;
    stripe_payment_id: string | null;
    status: string;
    thanked: boolean;
    created_at: string;
  };
  const gifts = (data ?? []) as RawGift[];

  // Denormalize with gift_page + owner info in a single pass.
  const pageIds = Array.from(new Set(gifts.map((g) => g.gift_page_id)));
  const { data: pagesData } =
    pageIds.length > 0
      ? await db
          .from("gift_pages")
          .select("id, slug, child_name, event_name, fund_ticker, user_id")
          .in("id", pageIds)
      : { data: [] };
  const pages = pagesData ?? [];
  const ownerIds = Array.from(new Set(pages.map((p) => p.user_id)));
  const { data: ownersData } =
    ownerIds.length > 0
      ? await db.from("users").select("id, email").in("id", ownerIds)
      : { data: [] };
  const owners = ownersData ?? [];

  const pageById = new Map(pages.map((p) => [p.id, p]));
  const ownerById = new Map(owners.map((o) => [o.id, o]));

  type Row = RawGift & {
    gift_page_slug: string | null;
    gift_page_child_name: string | null;
    gift_page_event: string | null;
    gift_page_fund: string | null;
    owner_email: string | null;
  };

  const enriched: Row[] = gifts.map((g) => {
    const p = pageById.get(g.gift_page_id);
    const o = p ? ownerById.get(p.user_id) : undefined;
    return {
      ...g,
      gift_page_slug: p?.slug ?? null,
      gift_page_child_name: p?.child_name ?? null,
      gift_page_event: p?.event_name ?? null,
      gift_page_fund: p?.fund_ticker ?? null,
      owner_email: o?.email ?? null,
    };
  });

  const csv = toCsv<Row>(enriched, [
    { header: "id", get: (r) => r.id },
    { header: "gift_page_id", get: (r) => r.gift_page_id },
    { header: "gift_page_slug", get: (r) => r.gift_page_slug },
    { header: "gift_page_child_name", get: (r) => r.gift_page_child_name },
    { header: "gift_page_event", get: (r) => r.gift_page_event },
    { header: "gift_page_fund", get: (r) => r.gift_page_fund },
    { header: "owner_email", get: (r) => r.owner_email },
    { header: "amount_cents", get: (r) => r.amount_cents },
    { header: "giver_name", get: (r) => r.giver_name },
    { header: "giver_email", get: (r) => r.giver_email },
    { header: "note", get: (r) => r.note },
    { header: "status", get: (r) => r.status },
    { header: "stripe_payment_id", get: (r) => r.stripe_payment_id },
    { header: "thanked", get: (r) => r.thanked },
    { header: "created_at", get: (r) => r.created_at },
  ]);

  await db.from("admin_audit").insert({
    admin_email: session.user.email,
    action: "export_gifts",
    metadata: { row_count: enriched.length },
  });

  return csvResponse(csv, `seedgift-gifts-${csvDateStamp()}.csv`);
}
