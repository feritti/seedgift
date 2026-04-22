import Link from "next/link";
import { Search, ArrowLeft, CheckCircle, Circle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { listUsers } from "@/lib/actions/admin";
import { formatCurrency, formatDate } from "@/shared/utils/growth-calculator";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const q = params.q ?? "";
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const { rows, total } = await listUsers({ q, limit: PAGE_SIZE, offset });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <Link
            href="/admin"
            className="text-sm text-text-secondary hover:text-text-primary inline-flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Admin
          </Link>
          <h1 className="text-3xl text-text-primary mb-1">Users</h1>
          <p className="text-text-secondary">
            {total} total{q && ` · filtered by "${q}"`}
          </p>
        </div>

        <form method="GET" className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search by email or name..."
            className="pl-9 pr-4 py-2 rounded-[var(--radius-md)] border border-border bg-surface text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary min-w-[280px]"
          />
        </form>
      </div>

      <Card>
        <CardContent>
          {rows.length === 0 ? (
            <p className="text-sm text-text-secondary py-8 text-center">
              {q ? `No users matching "${q}"` : "No users yet."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-text-secondary uppercase tracking-wide border-b border-border-light">
                    <th className="pb-3 pr-4 font-medium">User</th>
                    <th className="pb-3 pr-4 font-medium">Stripe</th>
                    <th className="pb-3 pr-4 font-medium text-right">Pages</th>
                    <th className="pb-3 pr-4 font-medium text-right">
                      Gifts received
                    </th>
                    <th className="pb-3 pr-4 font-medium text-right">Total</th>
                    <th className="pb-3 pr-0 font-medium text-right">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((u) => (
                    <tr
                      key={u.id}
                      className="border-b border-border-light last:border-0 hover:bg-surface-muted transition-colors"
                    >
                      <td className="py-3 pr-4">
                        <Link
                          href={`/admin/users/${u.id}`}
                          className="block min-w-0"
                        >
                          <p className="font-medium text-text-primary">
                            {u.name ?? "—"}
                          </p>
                          <p className="text-xs text-text-secondary truncate">
                            {u.email}
                          </p>
                        </Link>
                      </td>
                      <td className="py-3 pr-4">
                        {u.stripeOnboarded ? (
                          <span className="inline-flex items-center gap-1 text-primary-dark text-xs">
                            <CheckCircle className="h-3.5 w-3.5" />
                            Connected
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-text-secondary text-xs">
                            <Circle className="h-3.5 w-3.5" />
                            Not connected
                          </span>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-right text-text-primary">
                        {u.giftPageCount}
                      </td>
                      <td className="py-3 pr-4 text-right text-text-primary">
                        {u.giftsReceivedCount}
                      </td>
                      <td className="py-3 pr-4 text-right text-text-primary">
                        {formatCurrency(u.giftsReceivedGrossCents / 100)}
                      </td>
                      <td className="py-3 pr-0 text-right text-text-secondary text-xs">
                        {formatDate(u.createdAt)}
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
                  pathname: "/admin/users",
                  query: { q: q || undefined, page: String(page - 1) },
                }}
                className="px-3 py-1.5 rounded-[var(--radius-md)] text-sm text-text-primary border border-border hover:bg-surface-muted transition-colors"
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={{
                  pathname: "/admin/users",
                  query: { q: q || undefined, page: String(page + 1) },
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
