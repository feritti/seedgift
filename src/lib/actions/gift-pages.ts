"use server";

import { auth } from "@/lib/auth";
import { createServerClient } from "@/lib/db";
import { redirect } from "next/navigation";
import { FUNDS } from "@/shared/constants/funds";

// Validation constants
const MAX_NAME_LENGTH = 100;
const MAX_EVENT_LENGTH = 100;
const MAX_PHOTO_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_PHOTO_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function generateSlug(childName: string, eventName: string): string {
  const base = `${childName}-${eventName}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const suffix = Math.random().toString(36).substring(2, 8);
  return `${base}-${suffix}`;
}

function validatePhoto(photo: File): { valid: boolean; error?: string } {
  if (photo.size > MAX_PHOTO_SIZE) {
    return { valid: false, error: "Photo must be under 2MB" };
  }
  if (!ALLOWED_PHOTO_TYPES.includes(photo.type)) {
    return { valid: false, error: "Photo must be JPEG, PNG, or WebP" };
  }
  const ext = photo.name.split(".").pop()?.toLowerCase();
  if (!ext || !ALLOWED_PHOTO_EXTENSIONS.includes(ext)) {
    return { valid: false, error: "Invalid file extension" };
  }
  return { valid: true };
}

function validateFormInputs(formData: FormData): {
  childName: string;
  childDob: string | null;
  eventName: string;
  fundTicker: string;
} {
  const childName = (formData.get("childName") as string)?.trim();
  const childDob = (formData.get("childDob") as string)?.trim() || null;
  const eventName = (formData.get("eventName") as string)?.trim();
  const fundTicker = (formData.get("fundTicker") as string)?.trim();

  if (!childName || childName.length < 1 || childName.length > MAX_NAME_LENGTH) {
    throw new Error(`Child name must be 1-${MAX_NAME_LENGTH} characters`);
  }
  if (!eventName || eventName.length < 1 || eventName.length > MAX_EVENT_LENGTH) {
    throw new Error(`Event name must be 1-${MAX_EVENT_LENGTH} characters`);
  }
  if (!fundTicker) {
    throw new Error("Fund selection is required");
  }
  // Validate DOB format if provided
  if (childDob && !/^\d{4}-\d{2}-\d{2}$/.test(childDob)) {
    throw new Error("Invalid date format");
  }
  if (childDob) {
    const date = new Date(childDob);
    if (isNaN(date.getTime()) || date > new Date()) {
      throw new Error("Date of birth must be in the past");
    }
  }

  return { childName, childDob, eventName, fundTicker };
}

async function handlePhotoUpload(
  db: ReturnType<typeof createServerClient>,
  photo: File,
  userId: string,
  identifier: string
): Promise<string | null> {
  const validation = validatePhoto(photo);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const ext = photo.name.split(".").pop()?.toLowerCase();
  // Use a sanitized path with only the known-safe extension
  const path = `${userId}/${identifier}.${ext}`;
  const { error: uploadError } = await db.storage
    .from("child-photos")
    .upload(path, photo, { upsert: true });

  if (uploadError) return null;

  const { data: urlData } = db.storage
    .from("child-photos")
    .getPublicUrl(path);
  return urlData.publicUrl;
}

export async function createGiftPage(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const { childName, childDob, eventName, fundTicker } = validateFormInputs(formData);

  const fund = FUNDS.find((f) => f.ticker === fundTicker);
  if (!fund) throw new Error("Invalid fund");

  const slug = generateSlug(childName, eventName);
  const db = createServerClient();

  // Handle photo upload
  let childPhotoUrl: string | null = null;
  const photo = formData.get("childPhoto") as File | null;
  if (photo && photo.size > 0) {
    childPhotoUrl = await handlePhotoUpload(db, photo, session.user.id, slug);
  }

  const { error } = await db.from("gift_pages").insert({
    user_id: session.user.id,
    slug,
    child_name: childName,
    child_photo_url: childPhotoUrl,
    child_dob: childDob,
    event_name: eventName,
    fund_ticker: fundTicker,
    fund_name: fund.name,
  });

  if (error) throw new Error(error.message);

  redirect("/gift-pages");
}

export async function updateGiftPage(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Validate ID format
  if (!UUID_REGEX.test(id)) throw new Error("Invalid gift page ID");

  const { childName, childDob, eventName, fundTicker } = validateFormInputs(formData);

  const fund = FUNDS.find((f) => f.ticker === fundTicker);
  if (!fund) throw new Error("Invalid fund");

  const db = createServerClient();

  const updates: Record<string, unknown> = {
    child_name: childName,
    child_dob: childDob,
    event_name: eventName,
    fund_ticker: fundTicker,
    fund_name: fund.name,
  };

  // Handle photo upload
  const photo = formData.get("childPhoto") as File | null;
  if (photo && photo.size > 0) {
    const photoUrl = await handlePhotoUpload(db, photo, session.user.id, id);
    if (photoUrl) {
      updates.child_photo_url = photoUrl;
    }
  }

  const { error } = await db
    .from("gift_pages")
    .update(updates)
    .eq("id", id)
    .eq("user_id", session.user.id);

  if (error) throw new Error(error.message);

  redirect("/gift-pages");
}

export async function deleteGiftPage(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const db = createServerClient();

  const { error } = await db
    .from("gift_pages")
    .update({ status: "archived" })
    .eq("id", id)
    .eq("user_id", session.user.id);

  if (error) throw new Error(error.message);

  redirect("/gift-pages");
}

export async function getMyGiftPages() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const db = createServerClient();

  const { data } = await db
    .from("gift_pages")
    .select("*, gifts(amount_cents, status)")
    .eq("user_id", session.user.id)
    .neq("status", "archived")
    .order("created_at", { ascending: false });

  return (data ?? []).map((page) => ({
    ...page,
    giftsCount: page.gifts?.filter((g: { status: string }) => g.status === "completed").length ?? 0,
    totalGifted: page.gifts
      ?.filter((g: { status: string }) => g.status === "completed")
      .reduce((sum: number, g: { amount_cents: number }) => sum + g.amount_cents, 0) ?? 0,
  }));
}

export async function getGiftPage(id: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const db = createServerClient();

  const { data } = await db
    .from("gift_pages")
    .select("*")
    .eq("id", id)
    .eq("user_id", session.user.id)
    .single();

  return data;
}

export async function getGiftPageBySlug(slug: string) {
  const db = createServerClient();

  const { data } = await db
    .from("gift_pages")
    .select("*")
    .eq("slug", slug)
    .eq("status", "active")
    .single();

  return data;
}

/** Fetch public gift data for the gift page view (recent gifts, totals, parent name) */
export async function getGiftPagePublicData(giftPageId: string) {
  const db = createServerClient();

  // Get recent completed gifts (public: name, amount, date only)
  const { data: gifts } = await db
    .from("gifts")
    .select("giver_name, amount_cents, created_at")
    .eq("gift_page_id", giftPageId)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(20);

  // Get parent name from the users table via the gift page
  const { data: giftPage } = await db
    .from("gift_pages")
    .select("user_id")
    .eq("id", giftPageId)
    .single();

  let parentName: string | null = null;
  if (giftPage?.user_id) {
    const { data: user } = await db
      .from("users")
      .select("name")
      .eq("id", giftPage.user_id)
      .single();
    parentName = user?.name ?? null;
  }

  const completedGifts = gifts ?? [];
  const totalRaised = completedGifts.reduce((sum, g) => sum + g.amount_cents, 0);
  const giftCount = completedGifts.length;

  return {
    recentGifts: completedGifts.map((g) => ({
      giverName: g.giver_name,
      amountCents: g.amount_cents,
      createdAt: g.created_at,
    })),
    totalRaisedCents: totalRaised,
    giftCount,
    parentName,
  };
}
