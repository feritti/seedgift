import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Gift,
  Users,
  DollarSign,
  Plus,
  Eye,
  CreditCard,
  CheckCircle,
  Circle,
  Heart,
  ArrowRight,
} from "lucide-react";
import { getDashboardStats } from "@/lib/actions/dashboard";
import {
  formatCurrency,
  formatDate,
} from "@/shared/utils/growth-calculator";
import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const [stats, session] = await Promise.all([getDashboardStats(), auth()]);

  const totalGifted = stats ? stats.totalGiftedCents / 100 : 0;
  const activePages = stats?.activeGiftPages ?? 0;
  const giftsCount = stats?.giftsCount ?? 0;
  const projectedGrowth = stats?.projectedGrowthTotal ?? 0;
  const recentGifts = stats?.recentGifts ?? [];

  const stripeOnboarded =
    (session?.user as { stripeOnboarded?: boolean })?.stripeOnboarded ?? false;

  // Setup checklist
  const hasGiftPage = activePages > 0;
  const hasStripe = stripeOnboarded;
  const hasGifts = giftsCount > 0;
  const setupComplete = hasGiftPage && hasStripe && hasGifts;
  const stepsComplete = [hasGiftPage, hasStripe, hasGifts].filter(Boolean).length;

  const overviewCards = [
    {
      title: "Total Gifted",
      value: formatCurrency(totalGifted),
      icon: DollarSign,
      variant: "featured" as const,
      description: "Across all gift pages",
    },
    {
      title: "Active Gift Pages",
      value: String(activePages),
      icon: Gift,
      variant: "default" as const,
      description: "Ready to receive gifts",
    },
    {
      title: "Gifts Received",
      value: String(giftsCount),
      icon: Users,
      variant: "default" as const,
      description: "From generous givers",
    },
    {
      title: "Projected Growth",
      value: formatCurrency(projectedGrowth),
      icon: TrendingUp,
      variant: "stat" as const,
      description: "Based on fund returns & child age",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl text-text-primary mb-1">Dashboard</h1>
        <p className="text-text-secondary">
          {activePages > 0
            ? "Here's how your gift pages are doing."
            : "Welcome to SeedGift. Let's get you set up."}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {overviewCards.map((card) => (
          <Card key={card.title} variant={card.variant}>
            <CardContent>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <card.icon className="h-5 w-5 text-primary" />
                </div>
                <p className="text-sm font-medium text-text-secondary">
                  {card.title}
                </p>
              </div>
              <p className="text-2xl font-bold text-text-primary">
                {card.value}
              </p>
              <p className="text-xs text-text-secondary mt-1">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Setup Checklist — only show when incomplete */}
      {!setupComplete && (
        <Card className="mb-8">
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary font-[family-name:var(--font-body)]">
                Getting Started
              </h2>
              <span className="text-sm text-text-secondary">
                {stepsComplete}/3 complete
              </span>
            </div>
            <div className="space-y-3">
              <ChecklistItem
                done={hasGiftPage}
                label="Create a gift page"
                href="/gift-pages/new"
              />
              <ChecklistItem
                done={hasGifts}
                label="Share your link & receive your first gift"
                href="/gift-pages"
              />
              <ChecklistItem
                done={hasStripe}
                label="Connect Stripe to receive payments"
                href="/settings"
              />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Gifts */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-text-primary font-[family-name:var(--font-body)]">
                  Recent Gifts
                </h2>
                {giftsCount > 0 && (
                  <Link
                    href="/gifts"
                    className="text-sm text-primary hover:text-primary-dark flex items-center gap-1"
                  >
                    View all
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>

              {recentGifts.length > 0 ? (
                <div className="space-y-3">
                  {recentGifts.map((gift) => (
                    <div
                      key={gift.id}
                      className="flex items-center gap-3 py-2 border-b border-border-light last:border-0"
                    >
                      <div className="w-9 h-9 rounded-full bg-primary-light flex items-center justify-center shrink-0">
                        <Heart className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">
                          {gift.giver_name}
                        </p>
                        <p className="text-xs text-text-secondary">
                          for {gift.child_name} &middot;{" "}
                          {formatDate(gift.created_at)}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-text-primary">
                        {formatCurrency(gift.amount_cents / 100)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center mx-auto mb-3">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-sm text-text-secondary">
                    No gifts yet. Share your gift page link to get started!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <Card>
            <CardContent>
              <h2 className="text-lg font-semibold text-text-primary mb-4 font-[family-name:var(--font-body)]">
                Quick Actions
              </h2>
              <div className="space-y-2">
                <Link href="/gift-pages/new" className="block">
                  <Button variant="primary" className="w-full justify-start">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Gift Page
                  </Button>
                </Link>
                <Link href="/gift-pages" className="block">
                  <Button variant="ghost" className="w-full justify-start">
                    <Eye className="h-4 w-4 mr-2" />
                    View Gift Pages
                  </Button>
                </Link>
                {!stripeOnboarded && (
                  <Link href="/settings" className="block">
                    <Button variant="ghost" className="w-full justify-start">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Connect Stripe
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ChecklistItem({
  done,
  label,
  href,
}: {
  done: boolean;
  label: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-2 rounded-[var(--radius-md)] hover:bg-surface-muted transition-colors"
    >
      {done ? (
        <CheckCircle className="h-5 w-5 text-primary shrink-0" />
      ) : (
        <Circle className="h-5 w-5 text-border shrink-0" />
      )}
      <span
        className={
          done
            ? "text-sm text-text-secondary line-through"
            : "text-sm text-text-primary"
        }
      >
        {label}
      </span>
      {!done && <ArrowRight className="h-4 w-4 text-text-secondary ml-auto" />}
    </Link>
  );
}
