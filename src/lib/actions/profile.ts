"use server";

import { auth } from "@/lib/auth";
import { createServerClient } from "@/lib/db";

const MAX_NAME_LENGTH = 100;
const MAX_PHOTO_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function updateProfile(formData: FormData): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const name = (formData.get("name") as string)?.trim();
  if (!name || name.length < 1 || name.length > MAX_NAME_LENGTH) {
    return { error: `Name must be 1-${MAX_NAME_LENGTH} characters` };
  }

  const db = createServerClient();
  const updates: { name: string; image?: string } = { name };

  const photo = formData.get("avatar") as File | null;
  if (photo && photo.size > 0) {
    if (photo.size > MAX_PHOTO_SIZE) {
      return { error: "Photo must be under 2MB" };
    }
    if (!ALLOWED_PHOTO_TYPES.includes(photo.type)) {
      return { error: "Photo must be JPEG, PNG, or WebP" };
    }

    const ext = photo.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${session.user.id}/avatar.${ext}`;

    const { error: uploadError } = await db.storage
      .from("avatars")
      .upload(path, photo, { upsert: true, contentType: photo.type });

    if (uploadError) {
      return { error: "Failed to upload photo. Please try again." };
    }

    const { data: urlData } = db.storage.from("avatars").getPublicUrl(path);
    updates.image = `${urlData.publicUrl}?t=${Date.now()}`;
  }

  const { error: dbError } = await db
    .from("users")
    .update(updates)
    .eq("id", session.user.id);

  if (dbError) {
    return { error: "Failed to save profile. Please try again." };
  }

  return {};
}
