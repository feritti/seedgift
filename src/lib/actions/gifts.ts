"use server";

import { auth } from "@/lib/auth";
import { createServerClient } from "@/lib/db";

export async function getMyGifts() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const db = createServerClient();

  // Get all gift page IDs for this user
  const { data: giftPages } = await db
    .from("gift_pages")
    .select("id, child_name")
    .eq("user_id", session.user.id);

  if (!giftPages || giftPages.length === 0) return [];

  const pageIds = giftPages.map((p) => p.id);
  const pageMap = Object.fromEntries(giftPages.map((p) => [p.id, p.child_name]));

  const { data: gifts } = await db
    .from("gifts")
    .select("*")
    .in("gift_page_id", pageIds)
    .order("created_at", { ascending: false });

  return (gifts ?? []).map((gift) => ({
    ...gift,
    giftPageChildName: pageMap[gift.gift_page_id] ?? "Unknown",
  }));
}

export async function markGiftThanked(giftId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const db = createServerClient();

  // Verify ownership through gift_page
  const { data: gift } = await db
    .from("gifts")
    .select("gift_page_id")
    .eq("id", giftId)
    .single();

  if (!gift) throw new Error("Gift not found");

  const { data: page } = await db
    .from("gift_pages")
    .select("user_id")
    .eq("id", gift.gift_page_id)
    .single();

  if (!page || page.user_id !== session.user.id) throw new Error("Unauthorized");

  await db.from("gifts").update({ thanked: true }).eq("id", giftId);
}
