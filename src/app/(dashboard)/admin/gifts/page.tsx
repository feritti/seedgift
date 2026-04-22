import Link from "next/link";
import { ArrowLeft, ExternalLink, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/admin/status-badge";
import {
  listAllGifts,
  type AdminGiftSource,
} from "@/lib/actions/admin";
import { formatCurrency, formatDate } from "@/shared/utils/growth-calculator";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 100;
const SOURCE_FILTERS = ["all", "gift", "sent_gift"] as const;
const STATUS_FILTERS = [
  "all",
  "completed",
  "pending",
  "failed",
  "refunded",
] as const;

const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

export default async function AdminGiftsPage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string; status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const source =
    params.source && (SOURCE_FILTERS as readonly string[]).includes(params.source)
      ? (params.source as (typeof SOURCE_FILTERS)[number])
      : "all";
  const status =
    params.status && (STATUS_FILTERS as readonly string[]).includes(params.status)
      ? params.status
      : "all";
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const { rows, total } = await listAllGifts({
    source:
      source === "all" ? undefined : (source as AdminGiftSource),
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
        <h1 className="text-3xl text-text-primary mb-1">Gifts</h1>
        <p className="text-text-secondary">
          Unified view — both gift-page donations and giver-initiated sent
          gifts. Amber dot = pending &gt; 2h (likely stuck).
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap items-center">
        <div className="flex gap-1 flex-wrap">
          <span className="text-xs text-text-secondary mr-1 self-center">
            Source:
          </span>
          {SOURCE_FILTERS.map((s) => (
            <Link
              key={s}
              href={{
                pathname: "/admin/gifts",
                query: {
                  ...(s === "all" ? {} : { source: s }),
                  ...(status === "all" ? {} : { status }),
                },
              }}
              className={
                s === source
                  ? "px-3 py-1.5 rounded-full text-xs font-medium bg-primary text-text-inverse"
                  : "px-3 py-1.5 rounded-full text-xs font-medium bg-surface text-text-secondary border border-border hover:bg-surface-muted transition-colors"
              }
            >
              {s === "sent_gift" ? "sent gift" : s}
            </Link>
          ))}
        </div>
        <div className="flex gap-1 flex-wrap">
          <span className="text-xs text-text-secondary mr-1 self-center">
            Status:
          </span>
          {STATUS_FILTERS.map((s) => (
            <Link
              key={s}
              href={{
                pathname: "/admin/gifts",
                query: {
                  ...(source === "all" ? {} : { source }),
                  ...(s === "all" ? {} : { status: s }),
                },
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
      </div>

      <Card>
        <CardContent>
          {rows.length === 0 ? (
            <p className="text-sm text-text-secondary py-8 text-center">
              No gifts match these filters.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-text-secondary uppercase tracking-wide border-b border-border-light">
                    <th className="pb-3 pr-4 font-medium">Source</th>
                    <th className="pb-3 pr-4 font-medium">Giver</th>
                    <th className="pb-3 pr-4 font-medium">Recipient</th>
                    <th className="pb-3 pr-4 font-medium text-right">Amount</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 pr-4 font-medium text-right">Date</th>
                    <th className="pb-3 pr-0 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((g) => {
                    const isStuck =
                      g.status === "pending" &&
                      Date.now() - new Date(g.createdAt).getTime() >
                        TWO_HOURS_MS;
                    return (
                      <tr
                        key={`${g.source}-${g.id}`}
                        className="border-b border-border-light last:border-0 hover:bg-surface-muted transition-colors"
                      >
                        <td className="py-3 pr-4">
                          <span
                            className={
                              g.source === "sent_gift"
                                ? "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-light text-primary-dark"
                                : "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-surface-muted text-text-secondary"
                            }
                          >
                            {g.source === "sent_gift" ? "sent gift" : "gift"}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          <p className="text-text-primary">{g.giverName}</p>
                          <p className="text-xs text-text-secondary truncate">
                            {g.giverEmail}
                          </p>
                        </td>
                        <td className="py-3 pr-4 text-text-primary">
                          {g.recipientLabel}
                        </td>
                        <td className="py-3 pr-4 text-right font-semibold text-text-primary">
                          {formatCurrency(g.amountCents / 100)}
                        </td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-1.5">
                            {isStuck && (
                              <span title="Pending > 2 hours — likely stuck">
                                <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                              </span>
                            )}
                            <StatusBadge status={g.status} />
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-right text-text-secondary text-xs">
                          {formatDate(g.createdAt)}
                        </td>
                        <td className="py-3 pr-0 text-right whitespace-nowrap">
                          <Link
                            href={g.href}
                            target="_blank"
                            className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                          >
                            View
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                          {g.stripePaymentId && (
                            <a
                              href={`https://dashboard.stripe.com/payments/${g.stripePaymentId}`}
                              target="_blank"
                              rel="noreferrer"
                              className="ml-3 text-xs text-primary hover:underline inline-flex items-center gap-1"
                            >
                              Stripe
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
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
                href={{
                  pathname: "/admin/gifts",
                  query: {
                    ...(source === "all" ? {} : { source }),
                    ...(status === "all" ? {} : { status }),
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
                  pathname: "/admin/gifts",
                  query: {
                    ...(source === "all" ? {} : { source }),
                    ...(status === "all" ? {} : { status }),
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
