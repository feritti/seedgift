import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/admin/status-badge";
import { listGiftPages } from "@/lib/actions/admin";
import { formatCurrency, formatDate } from "@/shared/utils/growth-calculator";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;
const STATUS_FILTERS = ["all", "active", "paused", "archived"] as const;

export default async function AdminGiftPagesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const status =
    params.status && STATUS_FILTERS.includes(params.status as (typeof STATUS_FILTERS)[number])
      ? params.status
      : "all";
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const { rows, total } = await listGiftPages({
    status: status === "all" ? undefined : status,
    limit: PAGE_SIZE,
    offset,
  });
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
        <h1 className="text-3xl text-text-primary mb-1">Gift pages</h1>
        <p className="text-text-secondary">
          {total} total{status !== "all" && ` · showing "${status}"`}
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {STATUS_FILTERS.map((s) => (
          <Link
            key={s}
            href={{
              pathname: "/admin/gift-pages",
              query: s === "all" ? {} : { status: s },
            }}
            className={
              s === status
                ? "px-3 py-1.5 rounded-full text-xs font-medium bg-primary text-text-inverse"
                : "px-3 py-1.5 rounded-full text-xs font-medium bg-surface text-text-secondary border border-border hover:bg-surface-muted transition-colors"
            }
          >
            {s}
          </Link>
        ))}
      </div>

      <Card>
        <CardContent>
          {rows.length === 0 ? (
            <p className="text-sm text-text-secondary py-8 text-center">
              No gift pages.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-text-secondary uppercase tracking-wide border-b border-border-light">
                    <th className="pb-3 pr-4 font-medium">Page</th>
                    <th className="pb-3 pr-4 font-medium">Owner</th>
                    <th className="pb-3 pr-4 font-medium">Fund</th>
                    <th className="pb-3 pr-4 font-medium text-right">
                      Raised
                    </th>
                    <th className="pb-3 pr-4 font-medium text-right">Gifts</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 pr-4 font-medium text-right">Created</th>
                    <th className="pb-3 pr-0 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-border-light last:border-0 hover:bg-surface-muted transition-colors"
                    >
                      <td className="py-3 pr-4">
                        <p className="font-medium text-text-primary">
                          {p.childName}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {p.eventName}
                        </p>
                      </td>
                      <td className="py-3 pr-4">
                        <Link
                          href={`/admin/users/${p.ownerId}`}
                          className="text-xs text-text-primary hover:text-primary"
                        >
                          {p.ownerName ?? p.ownerEmail ?? "—"}
                        </Link>
                        {p.ownerEmail && p.ownerName && (
                          <p className="text-xs text-text-secondary truncate">
                            {p.ownerEmail}
                          </p>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-text-secondary text-xs">
                        {p.fundTicker}
                      </td>
                      <td className="py-3 pr-4 text-right text-text-primary">
                        {formatCurrency(p.totalRaisedCents / 100)}
                      </td>
                      <td className="py-3 pr-4 text-right text-text-primary">
                        {p.giftCount}
                      </td>
                      <td className="py-3 pr-4">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="py-3 pr-4 text-right text-text-secondary text-xs">
                        {formatDate(p.createdAt)}
                      </td>
                      <td className="py-3 pr-0 text-right">
                        <Link
                          href={`/gift/${p.slug}`}
                          target="_blank"
                          className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                        >
                          View
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
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
                href={{
                  pathname: "/admin/gift-pages",
                  query: {
                    status: status === "all" ? undefined : status,
                    page: String(page - 1),
                  },
                }}
                className="px-3 py-1.5 rounded-[var(--radius-md)] text-sm text-text-primary border border-border hover:bg-surface-muted transition-colors"
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={{
                  pathname: "/admin/gift-pages",
                  query: {
                    status: status === "all" ? undefined : status,
                    page: String(page + 1),
                  },
                }}
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
