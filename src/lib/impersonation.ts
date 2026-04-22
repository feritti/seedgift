import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * A short-lived signed cookie that remembers who the admin was before they
 * started impersonating someone. Value format:
 *
 *     <admin_email>.<exp_unix_seconds>.<hex_hmac_sha256>
 *
 * The HMAC prevents a client-side cookie injection (e.g. via XSS) from
 * claiming admin origin without access to IMPERSONATION_COOKIE_SECRET.
 *
 * Lifetime is 1 hour — if the admin hasn't clicked "Exit impersonation" by
 * then, they're kicked back to /login to reauthenticate.
 */

export const IMPERSONATION_COOKIE = "impersonation_origin";
const MAX_AGE_SECONDS = 60 * 60;

function secret(): Buffer {
  const hex = process.env.IMPERSONATION_COOKIE_SECRET;
  if (!hex || hex.length < 32) {
    throw new Error(
      "IMPERSONATION_COOKIE_SECRET is not configured (need 32+ hex chars)."
    );
  }
  return Buffer.from(hex, "hex");
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

export function createCookieValue(adminEmail: string): string {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS;
  const payload = `${adminEmail}.${exp}`;
  return `${payload}.${sign(payload)}`;
}

export function parseCookieValue(
  raw: string | undefined
): { adminEmail: string; expiresAt: number } | null {
  if (!raw) return null;
  const parts = raw.split(".");
  if (parts.length < 3) return null;
  const hmac = parts[parts.length - 1];
  const exp = parts[parts.length - 2];
  const email = parts.slice(0, -2).join(".");
  const payload = `${email}.${exp}`;

  let expected: string;
  try {
    expected = sign(payload);
  } catch {
    // Secret missing — refuse to trust the cookie.
    return null;
  }

  if (expected.length !== hmac.length) return null;
  try {
    if (
      !timingSafeEqual(
        Buffer.from(expected, "hex"),
        Buffer.from(hmac, "hex")
      )
    ) {
      return null;
    }
  } catch {
    return null;
  }

  const expiresAt = Number(exp);
  if (!Number.isFinite(expiresAt) || expiresAt * 1000 < Date.now()) {
    return null;
  }
  return { adminEmail: email, expiresAt };
}

export const impersonationCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: MAX_AGE_SECONDS,
};
