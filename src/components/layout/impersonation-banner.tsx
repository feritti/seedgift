import { cookies } from "next/headers";
import { ShieldAlert } from "lucide-react";
import {
  IMPERSONATION_COOKIE,
  parseCookieValue,
} from "@/lib/impersonation";
import { getSession } from "@/lib/auth";
import { stopImpersonation } from "@/lib/actions/admin-impersonation";

/**
 * Rendered in the root layout. Returns null when no valid impersonation
 * cookie is present, so there is zero visual impact on normal browsing.
 * During impersonation, shows a non-dismissable red band with an
 * Exit button that submits stopImpersonation as a form action.
 */
export async function ImpersonationBanner() {
  const store = await cookies();
  const parsed = parseCookieValue(store.get(IMPERSONATION_COOKIE)?.value);
  if (!parsed) return null;

  const session = await getSession();
  const currentEmail = session?.user.email ?? "(signed out)";

  return (
    <div className="sticky top-0 z-[100] bg-red-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-sm min-w-0">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span className="truncate">
            <strong>Impersonating</strong> {currentEmail} · admin:{" "}
            {parsed.adminEmail}
          </span>
        </div>
        <form action={stopImpersonation}>
          <button
            type="submit"
            className="text-sm font-semibold underline hover:no-underline cursor-pointer whitespace-nowrap"
          >
            Exit impersonation
          </button>
        </form>
      </div>
    </div>
  );
}
