import Link from "next/link";
import {
  Users,
  CreditCard,
  Gift,
  DollarSign,
  Heart,
  Sparkles,
  AlertTriangle,
  Repeat,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AdminStatCard } from "@/components/admin/stat-card";
import { ActivityItem } from "@/components/admin/activity-item";
import { AdminSignupChart } from "@/components/admin/signup-chart";
import { AdminGiftVolumeChart } from "@/components/admin/gift-volume-chart";
import { getAdminOverview } from "@/lib/actions/admin";
import { formatCurrency } from "@/shared/utils/growth-calculator";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const overview = await getAdminOverview();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl text-text-primary mb-1">Admin</h1>
        <p className="text-text-secondary">
          Platform-wide view across users, gift pages, gifts, and payments.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <AdminStatCard
          title="Total Users"
          value={String(overview.totalUsers)}
          description={`+${overview.usersLast7d} this week · +${overview.usersLast30d} this month`}
          icon={Users}
        />
        <AdminStatCard
          title="Stripe Connected"
          value={`${overview.stripeOnboardedPct}%`}
          description={`${overview.stripeOnboardedCount} / ${overview.totalUsers} parents onboarded`}
          icon={CreditCard}
        />
        <AdminStatCard
          title="Active Gift Pages"
          value={String(overview.activeGiftPages)}
          description={`${overview.pausedGiftPages} paused · ${overview.archivedGiftPages} archived`}
          icon={Gift}
        />
        <AdminStatCard
          title="Gross Volume"
          value={formatCurrency(
            (overview.completedGiftsGrossCents +
              overview.sentGiftsCompletedGrossCents) /
              100
          )}
          description={`${
            overview.completedGiftsCount + overview.sentGiftsCompletedCount
          } completed gifts`}
          icon={DollarSign}
        />
        <AdminStatCard
          title="Completed Gifts"
          value={String(overview.completedGiftsCount)}
          description={formatCurrency(overview.completedGiftsGrossCents / 100)}
          icon={Heart}
        />
        <AdminStatCard
          title="Sent Gifts"
          value={String(overview.sentGiftsCompletedCount)}
          description={formatCurrency(
            overview.sentGiftsCompletedGrossCents / 100
          )}
          icon={Sparkles}
        />
        <AdminStatCard
          title="Pending / Failed"
          value={String(
            overview.pendingGiftsCount +
              overview.failedGiftsCount +
              overview.sentGiftsPendingCount
          )}
          description={`${overview.pendingGiftsCount} pending · ${overview.failedGiftsCount} failed · ${overview.refundedGiftsCount} refunded`}
          icon={AlertTriangle}
          accent={
            overview.pendingGiftsCount +
              overview.failedGiftsCount +
              overview.sentGiftsPendingCount >
            0
              ? "amber"
              : "default"
          }
        />
        <AdminStatCard
          title="Repeat Givers"
          value={String(overview.repeatGiverCount)}
          description="Givers with 2+ gifts"
          icon={Repeat}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary font-[family-name:var(--font-body)]">
                Signups (30 days)
              </h2>
              <span className="text-sm text-text-secondary">
                {overview.usersLast30d} total
              </span>
            </div>
            <AdminSignupChart data={overview.signupSeries} />
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary font-[family-name:var(--font-body)]">
                Gift volume (30 days)
              </h2>
              <span className="text-sm text-text-secondary">
                {formatCurrency(
                  overview.giftSeries.reduce((s, d) => s + d.grossCents, 0) /
                    100
                )}
              </span>
            </div>
            <AdminGiftVolumeChart data={overview.giftSeries} />
          </CardContent>
        </Card>
      </div>

      {/* Quick links + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardContent>
              <h2 className="text-lg font-semibold text-text-primary mb-4 font-[family-name:var(--font-body)]">
                Recent activity
              </h2>
              {overview.recentActivity.length > 0 ? (
                <div className="space-y-1">
                  {overview.recentActivity.map((event) => (
                    <ActivityItem
                      key={`${event.kind}-${event.id}`}
                      event={event}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-secondary py-4 text-center">
                  No activity yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardContent>
              <h2 className="text-lg font-semibold text-text-primary mb-4 font-[family-name:var(--font-body)]">
                Jump to
              </h2>
              <nav className="space-y-2">
                <AdminLink href="/admin/users" label="All users" />
                <AdminLink href="/admin/gift-pages" label="All gift pages" />
                <AdminLink href="/admin/gifts" label="All gifts" />
                <AdminLink href="/admin/stripe" label="Stripe — live data" />
              </nav>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function AdminLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between px-3 py-2 rounded-[var(--radius-md)] text-sm text-text-primary hover:bg-surface-muted transition-colors"
    >
      <span>{label}</span>
      <ArrowRight className="h-4 w-4 text-text-secondary" />
    </Link>
  );
}
