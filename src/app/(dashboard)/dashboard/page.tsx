import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Gift, Users, DollarSign } from "lucide-react";
import { getDashboardStats } from "@/lib/actions/dashboard";
import { formatCurrency } from "@/shared/utils/growth-calculator";

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  const totalGifted = stats ? stats.totalGiftedCents / 100 : 0;
  const activePages = stats?.activeGiftPages ?? 0;
  const giftsCount = stats?.giftsCount ?? 0;
  const projectedGrowth = totalGifted * Math.pow(1.1, 18);

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
      description: "Estimated value in 18 years",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl text-text-primary mb-1">Dashboard</h1>
        <p className="text-text-secondary">
          {activePages > 0
            ? "Here's how your gift pages are doing."
            : "Welcome to SeedGift. Create a gift page to start receiving gifts."}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
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
              <p className="text-2xl font-bold text-text-primary">{card.value}</p>
              <p className="text-xs text-text-secondary mt-1">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {activePages === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center mx-auto mb-4">
              <Gift className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2 font-[family-name:var(--font-body)]">
              Create your first gift page
            </h3>
            <p className="text-text-secondary mb-6 max-w-md mx-auto">
              Set up a gift page for your child and share the link with family and
              friends. They can send financial gifts in under a minute.
            </p>
            <a
              href="/gift-pages/new"
              className="inline-flex items-center justify-center font-semibold rounded-full transition-colors duration-200 bg-primary text-text-inverse hover:bg-primary-dark px-6 py-2.5 text-base"
            >
              Create Gift Page
            </a>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
