"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/admin";
import { createServerClient } from "@/lib/db";
import { getSession } from "@/lib/auth";
import {
  IMPERSONATION_COOKIE,
  createCookieValue,
  impersonationCookieOptions,
  parseCookieValue,
} from "@/lib/impersonation";

/**
 * Keep in sync with the check in src/lib/auth.ts / src/lib/admin.ts.
 * Inlined here to avoid a circular import with src/lib/admin.ts.
 */
function adminEmailsList(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Admin-only: sign in as another user. Writes an audit row, stamps a signed
 * cookie remembering the admin's original email, then redirects the browser
 * to a Supabase magic-link URL that will swap the session cookie to the
 * target user atomically.
 */
export async function startImpersonation(targetUserId: string): Promise<void> {
  const session = await requireAdminSession();
  const db = createServerClient();

  const { data: target } = await db
    .from("users")
    .select("id, email")
    .eq("id", targetUserId)
    .single();
  if (!target) throw new Error("Target user not found");
  if (target.email.toLowerCase() === session.user.email.toLowerCase()) {
    throw new Error("You can't impersonate yourself.");
  }
  if (adminEmailsList().includes(target.email.toLowerCase())) {
    throw new Error("Cannot impersonate another admin.");
  }

  await db.from("admin_audit").insert({
    admin_email: session.user.email,
    action: "impersonation_started",
    subject_type: "user",
    subject_id: target.id,
    metadata: {
      target_email: target.email,
      admin_email: session.user.email,
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const { data, error } = await db.auth.admin.generateLink({
    type: "magiclink",
    email: target.email,
    options: { redirectTo: `${appUrl}/dashboard` },
  });
  if (error || !data?.properties?.action_link) {
    throw new Error(
      `Could not start impersonation: ${error?.message ?? "no action link returned"}`
    );
  }

  const store = await cookies();
  store.set(
    IMPERSONATION_COOKIE,
    createCookieValue(session.user.email),
    impersonationCookieOptions
  );

  redirect(data.properties.action_link);
}

/**
 * Verifies the signed cookie, writes an audit row, clears the cookie, then
 * redirects to a magic-link URL for the admin's original email so their
 * session is restored.
 */
export async function stopImpersonation(): Promise<void> {
  const store = await cookies();
  const raw = store.get(IMPERSONATION_COOKIE)?.value;
  const parsed = parseCookieValue(raw);

  if (!parsed) {
    store.delete(IMPERSONATION_COOKIE);
    redirect("/login");
  }
  if (!adminEmailsList().includes(parsed.adminEmail.toLowerCase())) {
    store.delete(IMPERSONATION_COOKIE);
    throw new Error("Your admin access has been revoked.");
  }

  const current = await getSession();

  const db = createServerClient();
  await db.from("admin_audit").insert({
    admin_email: parsed.adminEmail,
    action: "impersonation_ended",
    subject_type: "user",
    subject_id: current?.user.id ?? null,
    metadata: {
      admin_email: parsed.adminEmail,
      was_as: current?.user.email ?? null,
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const { data, error } = await db.auth.admin.generateLink({
    type: "magiclink",
    email: parsed.adminEmail,
    options: { redirectTo: `${appUrl}/admin` },
  });
  if (error || !data?.properties?.action_link) {
    throw new Error(
      `Could not exit impersonation: ${error?.message ?? "no action link returned"}`
    );
  }

  store.delete(IMPERSONATION_COOKIE);
  redirect(data.properties.action_link);
}
