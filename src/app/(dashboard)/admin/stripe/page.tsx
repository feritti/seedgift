import Link from "next/link";
import { ArrowLeft, ExternalLink, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/admin/status-badge";
import { getStripeOverview } from "@/lib/actions/admin";

export const dynamic = "force-dynamic";

function formatStripeAmount(amount: number, currency: string): string {
  // Stripe amounts are in the smallest currency unit (cents for USD).
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

function formatTimestamp(unix: number): string {
  const d = new Date(unix * 1000);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function AdminStripePage() {
  const { balance, recentCharges, error } = await getStripeOverview();

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
        <h1 className="text-3xl text-text-primary mb-1">Stripe — live data</h1>
        <p className="text-text-secondary">
          Platform balance and the 20 most recent charges, read live from
          Stripe.
        </p>
      </div>

      {error && (
        <Card className="mb-6">
          <CardContent>
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-700">
                  Could not reach Stripe
                </p>
                <p className="text-xs text-red-600 mt-1">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {balance && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent>
              <p className="text-xs uppercase tracking-wide text-text-secondary mb-1">
                Available balance
              </p>
              {balance.available.length === 0 ? (
                <p className="text-2xl font-bold text-text-primary">$0.00</p>
              ) : (
                balance.available.map((b) => (
                  <p
                    key={b.currency}
                    className="text-2xl font-bold text-text-primary"
                  >
                    {formatStripeAmount(b.amount, b.currency)}
                  </p>
                ))
              )}
              <p className="text-xs text-text-secondary mt-1">
                Ready to transfer / pay out.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <p className="text-xs uppercase tracking-wide text-text-secondary mb-1">
                Pending balance
              </p>
              {balance.pending.length === 0 ? (
                <p className="text-2xl font-bold text-text-primary">$0.00</p>
              ) : (
                balance.pending.map((b) => (
                  <p
                    key={b.currency}
                    className="text-2xl font-bold text-text-primary"
                  >
                    {formatStripeAmount(b.amount, b.currency)}
                  </p>
                ))
              )}
              <p className="text-xs text-text-secondary mt-1">
                Still clearing the processor.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary font-[family-name:var(--font-body)]">
              Recent charges
            </h2>
            <a
              href="https://dashboard.stripe.com/payments"
              target="_blank"
              rel="noreferrer"
              className="text-sm text-primary hover:underline inline-flex items-center gap-1"
            >
              Open Stripe dashboard
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          {!recentCharges || recentCharges.length === 0 ? (
            <p className="text-sm text-text-secondary py-8 text-center">
              {error ? "Unavailable." : "No charges yet."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-text-secondary uppercase tracking-wide border-b border-border-light">
                    <th className="pb-3 pr-4 font-medium">ID</th>
                    <th className="pb-3 pr-4 font-medium">Description</th>
                    <th className="pb-3 pr-4 font-medium">Kind</th>
                    <th className="pb-3 pr-4 font-medium text-right">
                      Amount
                    </th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 pr-4 font-medium text-right">When</th>
                    <th className="pb-3 pr-0 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {recentCharges.map((c) => (
                    <tr
                      key={c.id}
                      className="border-b border-border-light last:border-0 hover:bg-surface-muted transition-colors"
                    >
                      <td className="py-3 pr-4">
                        <code className="text-xs text-text-secondary">
                          {c.id}
                        </code>
                      </td>
                      <td className="py-3 pr-4 text-text-primary max-w-[260px] truncate">
                        {c.description ?? "—"}
                      </td>
                      <td className="py-3 pr-4">
                        {c.metadataKind === "sent_gift" ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-light text-primary-dark">
                            sent gift
                          </span>
                        ) : (
                          <span className="text-xs text-text-secondary">
                            gift
                          </span>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-right font-semibold text-text-primary">
                        {formatStripeAmount(c.amount, c.currency)}
                      </td>
                      <td className="py-3 pr-4">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="py-3 pr-4 text-right text-text-secondary text-xs">
                        {formatTimestamp(c.created)}
                      </td>
                      <td className="py-3 pr-0 text-right whitespace-nowrap">
                        <a
                          href={`https://dashboard.stripe.com/payments/${c.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                        >
                          Stripe
                          <ExternalLink className="h-3 w-3" />
                        </a>
                        {c.receiptUrl && (
                          <a
                            href={c.receiptUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="ml-3 text-xs text-primary hover:underline inline-flex items-center gap-1"
                          >
                            Receipt
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
