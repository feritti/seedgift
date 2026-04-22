import { notFound } from "next/navigation";
import { getSession, type Session } from "@/lib/auth";

/**
 * Returns true when `email` is present (case-insensitive) in the
 * comma-separated ADMIN_EMAILS environment variable.
 *
 * Admin identity is intentionally env-driven rather than a DB column —
 * zero migration, trivially auditable, and easy to update without a
 * release.
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const list = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (list.length === 0) return false;
  return list.includes(email.toLowerCase());
}

/**
 * Guards an admin-only server context. Returns the session when the
 * caller is an admin; calls `notFound()` otherwise.
 *
 * Call this at the top of every admin server component, route handler,
 * and server action — the `/admin` layout guard is a defence-in-depth
 * layer, not the primary enforcement point. Server actions can be
 * invoked directly by a signed-in but non-admin user.
 */
export async function requireAdminSession(): Promise<Session> {
  const session = await getSession();
  if (!session?.isAdmin) {
    notFound();
  }
  return session;
}
