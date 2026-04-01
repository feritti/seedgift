"use server";

import { getSession } from "@/lib/auth";
import { createServerClient } from "@/lib/db";
import { getFundByTicker } from "@/shared/constants/funds";
import { calculateGrowth } from "@/shared/utils/growth-calculator";

export interface RecentGift {
  id: string;
  giver_name: string;
  amount_cents: number;
  created_at: string;
  child_name: string;
}

export async function getDashboardStats() {
  const session = await getSession();
  if (!session?.user?.id) return null;

  const db = createServerClient();

  // Get all active gift pages for this user with fund info and DOB
  const { data: giftPages } = await db
    .from("gift_pages")
    .select("id, fund_ticker, child_dob, child_name")
    .eq("user_id", session.user.id)
    .neq("status", "archived");

  const pages = giftPages ?? [];
  const pageIds = pages.map((p) => p.id);

  let totalGiftedCents = 0;
  let giftsCount = 0;
  let projectedGrowthTotal = 0;
  let recentGifts: RecentGift[] = [];

  if (pageIds.length > 0) {
    // Get completed gifts across all pages
    const { data: gifts } = await db
      .from("gifts")
      .select("amount_cents, gift_page_id")
      .in("gift_page_id", pageIds)
      .eq("status", "completed");

    if (gifts) {
      totalGiftedCents = gifts.reduce((sum, g) => sum + g.amount_cents, 0);
      giftsCount = gifts.length;

      // Calculate projected growth per page using actual fund returns and child age
      const giftsByPage = new Map<string, number>();
      for (const gift of gifts) {
        giftsByPage.set(
          gift.gift_page_id,
          (giftsByPage.get(gift.gift_page_id) ?? 0) + gift.amount_cents
        );
      }

      for (const page of pages) {
        const pageTotalCents = giftsByPage.get(page.id) ?? 0;
        if (pageTotalCents === 0) continue;

        const fund = getFundByTicker(page.fund_ticker);
        const annualReturn = fund?.avgAnnualReturn ?? 0.1;

        let years = 18;
        if (page.child_dob) {
          const dob = new Date(page.child_dob);
          const now = new Date();
          const ageYears =
            (now.getTime() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
          years = Math.max(1, Math.round(18 - ageYears));
        }

        projectedGrowthTotal += calculateGrowth(
          pageTotalCents / 100,
          annualReturn,
          years
        );
      }
    }

    // Get 5 most recent gifts with child name
    const { data: recent } = await db
      .from("gifts")
      .select("id, giver_name, amount_cents, created_at, gift_page_id")
      .in("gift_page_id", pageIds)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(5);

    if (recent) {
      const pageMap = new Map(pages.map((p) => [p.id, p.child_name]));
      recentGifts = recent.map((g) => ({
        id: g.id,
        giver_name: g.giver_name,
        amount_cents: g.amount_cents,
        created_at: g.created_at,
        child_name: pageMap.get(g.gift_page_id) ?? "Unknown",
      }));
    }
  }

  return {
    totalGiftedCents,
    activeGiftPages: pageIds.length,
    giftsCount,
    projectedGrowthTotal,
    recentGifts,
  };
}
