import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  CheckCircle,
  Circle,
  Gift,
  Heart,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/admin/status-badge";
import { ResendButton } from "@/components/admin/resend-button";
import { getUserDetail } from "@/lib/actions/admin";
import { formatCurrency, formatDate } from "@/shared/utils/growth-calculator";

export const dynamic = "force-dynamic";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getUserDetail(id);
  if (!detail) notFound();
  const { user, giftPages, recentGifts, incomingSentGifts } = detail;

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/users"
          className="text-sm text-text-secondary hover:text-text-primary inline-flex items-center gap-1 mb-2"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Users
        </Link>
        <h1 className="text-3xl text-text-primary mb-1">
          {user.name ?? user.email}
        </h1>
        <p className="text-text-secondary">{user.email}</p>
      </div>

      {/* Profile card */}
      <Card className="mb-6">
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <ProfileStat label="Joined" value={formatDate(user.createdAt)} />
            <ProfileStat
              label="Stripe Connect"
              value={
                user.stripeOnboarded ? (
                  <span className="inline-flex items-center gap-1 text-primary-dark">
                    <CheckCircle className="h-4 w-4" />
                    Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-text-secondary">
                    <Circle className="h-4 w-4" />
                    Not connected
                  </span>
                )
              }
              detail={
                user.stripeAccountId ? (
                  <a
                    href={`https://dashboard.stripe.com/connect/accounts/${user.stripeAccountId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                  >
                    {user.stripeAccountId}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : undefined
              }
            />
            <ProfileStat
              label="Gift pages"
              value={String(user.giftPageCount)}
            />
            <ProfileStat
              label="Total gifts received"
              value={formatCurrency(user.giftsReceivedGrossCents / 100)}
              detail={`${user.giftsReceivedCount} completed`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Gift pages */}
      <Card className="mb-6">
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <Gift className="h-5 w-5 text-text-secondary" />
            <h2 className="text-lg font-semibold text-text-primary font-[family-name:var(--font-body)]">
              Gift pages ({giftPages.length})
            </h2>
          </div>
          {giftPages.length === 0 ? (
            <p className="text-sm text-text-secondary py-4">
              No gift pages yet.
            </p>
          ) : (
            <div className="divide-y divide-border-light">
              {giftPages.map((p) => (
                <div
                  key={p.id}
                  className="py-3 flex items-center gap-4 flex-wrap"
                >
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/gift/${p.slug}`}
                      className="text-sm font-medium text-text-primary hover:text-primary"
                      target="_blank"
                    >
                      {p.childName} · {p.eventName}
                    </Link>
                    <p className="text-xs text-text-secondary">
                      {p.fundTicker} · {p.fundName} · created{" "}
                      {formatDate(p.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-text-primary">
                      {formatCurrency(p.totalRaisedCents / 100)}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {p.giftCount} gifts
                    </p>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent gifts received */}
      <Card className="mb-6">
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <Heart className="h-5 w-5 text-text-secondary" />
            <h2 className="text-lg font-semibold text-text-primary font-[family-name:var(--font-body)]">
              Recent gifts received
            </h2>
          </div>
          {recentGifts.length === 0 ? (
            <p className="text-sm text-text-secondary py-4">No gifts yet.</p>
          ) : (
            <div className="divide-y divide-border-light">
              {recentGifts.map((g) => (
                <div
                  key={g.id}
                  className="py-3 flex items-center gap-4 flex-wrap"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary">
                      <span className="font-medium">{g.giverName}</span>
                      <span className="text-text-secondary">
                        {" "}
                        → {g.giftPageChildName}
                      </span>
                    </p>
                    <p className="text-xs text-text-secondary">
                      {g.giverEmail} · {formatDate(g.createdAt)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-text-primary">
                    {formatCurrency(g.amountCents / 100)}
                  </p>
                  <StatusBadge status={g.status} />
                  {g.stripePaymentId && (
                    <a
                      href={`https://dashboard.stripe.com/payments/${g.stripePaymentId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                    >
                      Stripe
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {g.status === "completed" && (
                    <div className="flex items-center gap-3">
                      <ResendButton
                        rowId={g.id}
                        kind="gift_receipt"
                        label="Receipt"
                      />
                      <ResendButton
                        rowId={g.id}
                        kind="gift_notification"
                        label="Notif"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sent gifts addressed to this user's email */}
      <Card>
        <CardContent>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-text-secondary" />
            <h2 className="text-lg font-semibold text-text-primary font-[family-name:var(--font-body)]">
              Incoming sent gifts
            </h2>
          </div>
          <p className="text-xs text-text-secondary mb-4">
            Gifts sent to <code className="text-xs">{user.email}</code> via the
            /send-gift flow. Claiming is not yet implemented — these are listed
            here for visibility.
          </p>
          {incomingSentGifts.length === 0 ? (
            <p className="text-sm text-text-secondary py-4">None.</p>
          ) : (
            <div className="divide-y divide-border-light">
              {incomingSentGifts.map((s) => (
                <div
                  key={s.id}
                  className="py-3 flex items-center gap-4 flex-wrap"
                >
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/g/${s.slug}`}
                      className="text-sm font-medium text-text-primary hover:text-primary"
                      target="_blank"
                    >
                      {s.giverName} → {s.childName} · {s.occasion}
                    </Link>
                    <p className="text-xs text-text-secondary">
                      {s.giverEmail} · {formatDate(s.createdAt)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-text-primary">
                    {formatCurrency(s.amountCents / 100)}
                  </p>
                  <StatusBadge status={s.status} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ProfileStat({
  label,
  value,
  detail,
}: {
  label: string;
  value: React.ReactNode;
  detail?: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-text-secondary mb-1">
        {label}
      </p>
      <div className="text-sm font-medium text-text-primary">{value}</div>
      {detail && <div className="text-xs text-text-secondary mt-0.5">{detail}</div>}
    </div>
  );
}
