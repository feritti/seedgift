"use server";

import { auth } from "@/lib/auth";
import { createServerClient } from "@/lib/db";

export async function getDashboardStats() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const db = createServerClient();

  // Get all active gift pages for this user
  const { data: giftPages } = await db
    .from("gift_pages")
    .select("id")
    .eq("user_id", session.user.id)
    .neq("status", "archived");

  const pageIds = (giftPages ?? []).map((p) => p.id);

  // Get completed gifts across all pages
  let totalGiftedCents = 0;
  let giftsCount = 0;

  if (pageIds.length > 0) {
    const { data: gifts } = await db
      .from("gifts")
      .select("amount_cents")
      .in("gift_page_id", pageIds)
      .eq("status", "completed");

    if (gifts) {
      totalGiftedCents = gifts.reduce((sum, g) => sum + g.amount_cents, 0);
      giftsCount = gifts.length;
    }
  }

  return {
    totalGiftedCents,
    activeGiftPages: pageIds.length,
    giftsCount,
  };
}
