"use server";

import { getSession } from "@/lib/auth";
import { createServerClient } from "@/lib/db";
import { sendThankYouEmail } from "@/lib/email";

export async function getMyGifts() {
  const session = await getSession();
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

export async function markGiftThanked(giftId: string, message: string) {
  const session = await getSession();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const db = createServerClient();

  // Fetch gift with giver info
  const { data: gift } = await db
    .from("gifts")
    .select("gift_page_id, giver_email, giver_name")
    .eq("id", giftId)
    .single();

  if (!gift) throw new Error("Gift not found");

  // Verify ownership and get child name
  const { data: page } = await db
    .from("gift_pages")
    .select("user_id, child_name")
    .eq("id", gift.gift_page_id)
    .single();

  if (!page || page.user_id !== session.user.id) throw new Error("Unauthorized");

  // Send thank you email
  if (gift.giver_email && message) {
    try {
      await sendThankYouEmail({
        giverEmail: gift.giver_email,
        giverName: gift.giver_name || "Friend",
        childName: page.child_name,
        parentName: session.user.name || "A parent",
        message,
      });
    } catch {
      console.error("Failed to send thank you email for gift:", giftId);
    }
  }

  await db.from("gifts").update({ thanked: true }).eq("id", giftId);
}
