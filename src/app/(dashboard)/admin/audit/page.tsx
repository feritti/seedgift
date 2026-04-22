import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { listAuditEvents } from "@/lib/actions/admin";
import { formatDate } from "@/shared/utils/growth-calculator";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 100;

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function summariseMetadata(
  action: string,
  metadata: Record<string, unknown> | null
): string {
  if (!metadata) return "—";
  const m = metadata;
  if (action.endsWith("_refunded")) {
    const cents = typeof m.amount_cents === "number" ? m.amount_cents : 0;
    const reversed = m.reverse_transfer ? " · Connect reversed" : "";
    return `$${(cents / 100).toFixed(2)} · refund ${m.stripe_refund_id ?? ""}${reversed}`;
  }
  if (action.endsWith("_resent")) {
    return typeof m.to === "string" ? `to ${m.to}` : "email resent";
  }
  if (action === "gift_page_paused" || action === "gift_page_unpaused") {
    return `${m.previous} → ${m.current}`;
  }
  if (action.startsWith("export_")) {
    return `${m.row_count ?? 0} rows`;
  }
  return JSON.stringify(m);
}

function subjectHref(
  subjectType: string | null,
  subjectId: string | null
): string | null {
  if (!subjectType || !subjectId) return null;
  if (subjectType === "user") return `/admin/users/${subjectId}`;
  if (subjectType === "gift" || subjectType === "sent_gift") {
    return `/admin/gifts`;
  }
  if (subjectType === "gift_page") return `/admin/gift-pages`;
  return null;
}

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? "1") || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const { rows, total } = await listAuditEvents({ limit: PAGE_SIZE, offset });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin"
          className="text-sm text-text-secondary hover:text-text-primary inline-flex items-center gap-1 mb-2"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Admin
        </Link>
        <h1 className="text-3xl text-text-primary mb-1">Audit log</h1>
        <p className="text-text-secondary">
          Every admin write action. Append-only. {total} total events.
        </p>
      </div>

      <Card>
        <CardContent>
          {rows.length === 0 ? (
            <p className="text-sm text-text-secondary py-8 text-center">
              No admin actions recorded yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-text-secondary uppercase tracking-wide border-b border-border-light">
                    <th className="pb-3 pr-4 font-medium">When</th>
                    <th className="pb-3 pr-4 font-medium">Admin</th>
                    <th className="pb-3 pr-4 font-medium">Action</th>
                    <th className="pb-3 pr-4 font-medium">Subject</th>
                    <th className="pb-3 pr-0 font-medium">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((e) => {
                    const href = subjectHref(e.subjectType, e.subjectId);
                    return (
                      <tr
                        key={e.id}
                        className="border-b border-border-light last:border-0 hover:bg-surface-muted transition-colors"
                      >
                        <td className="py-3 pr-4 text-text-secondary text-xs whitespace-nowrap">
                          <span title={e.createdAt}>
                            {formatTimestamp(e.createdAt)}
                          </span>
                          <span className="sr-only">
                            {formatDate(e.createdAt)}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-text-primary text-xs truncate max-w-[220px]">
                          {e.adminEmail}
                        </td>
                        <td className="py-3 pr-4">
                          <code className="text-xs text-text-primary bg-surface-muted px-2 py-0.5 rounded">
                            {e.action}
                          </code>
                        </td>
                        <td className="py-3 pr-4 text-xs text-text-secondary">
                          {e.subjectType && e.subjectId ? (
                            href ? (
                              <Link
                                href={href}
                                className="text-primary hover:underline"
                              >
                                {e.subjectType} · {e.subjectId.slice(0, 8)}
                              </Link>
                            ) : (
                              <span>
                                {e.subjectType} · {e.subjectId.slice(0, 8)}
                              </span>
                            )
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="py-3 pr-0 text-text-secondary text-xs">
                          {summariseMetadata(e.action, e.metadata)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-text-secondary">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={{ pathname: "/admin/audit", query: { page: String(page - 1) } }}
                className="px-3 py-1.5 rounded-[var(--radius-md)] text-sm text-text-primary border border-border hover:bg-surface-muted transition-colors"
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={{ pathname: "/admin/audit", query: { page: String(page + 1) } }}
                className="px-3 py-1.5 rounded-[var(--radius-md)] text-sm text-text-primary border border-border hover:bg-surface-muted transition-colors"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
