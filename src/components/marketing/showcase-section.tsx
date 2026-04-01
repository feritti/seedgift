import { Heart, TrendingUp, Gift } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

const showcasePages = [
  {
    initials: "E",
    childName: "Emma",
    eventName: "1st Birthday",
    fundTicker: "VOO",
    fundName: "S&P 500 Index",
    avgReturn: "10%",
    raised: "$1,250",
    gifts: 8,
    color: "bg-pink-100 text-pink-600",
  },
  {
    initials: "L",
    childName: "Liam",
    eventName: "Baby Shower",
    fundTicker: "VTI",
    fundName: "Total US Stock Market",
    avgReturn: "9.8%",
    raised: "$3,475",
    gifts: 14,
    color: "bg-blue-100 text-blue-600",
  },
  {
    initials: "S",
    childName: "Sofia",
    eventName: "5th Birthday",
    fundTicker: "QQQ",
    fundName: "Nasdaq-100 Index",
    avgReturn: "12%",
    raised: "$820",
    gifts: 5,
    color: "bg-purple-100 text-purple-600",
  },
  {
    initials: "N",
    childName: "Noah",
    eventName: "Christening",
    fundTicker: "529",
    fundName: "529 College Savings",
    avgReturn: "7%",
    raised: "$2,100",
    gifts: 11,
    color: "bg-emerald-100 text-emerald-600",
  },
];

export function ShowcaseSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-primary tracking-wide uppercase mb-3">
            Real Examples
          </p>
          <h2 className="text-3xl sm:text-4xl text-text-primary">
            Gift Pages Powered by SeedGift
          </h2>
          <p className="text-text-secondary mt-4 max-w-2xl mx-auto">
            See how families are using SeedGift to build their children&apos;s financial future.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {showcasePages.map((page) => (
            <Card key={page.childName} className="hover:shadow-card-hover transition-shadow">
              <CardContent className="p-5">
                {/* Avatar + name */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`h-11 w-11 rounded-full ${page.color} font-bold flex items-center justify-center text-base shrink-0`}
                  >
                    {page.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-base font-semibold text-text-primary truncate">
                      {page.childName}&apos;s {page.eventName}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-text-secondary">
                      <TrendingUp className="h-3 w-3 text-primary" />
                      <span>{page.fundTicker} &middot; {page.avgReturn} avg.</span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between py-3 border-t border-border-light">
                  <div>
                    <p className="text-lg font-bold text-text-primary">{page.raised}</p>
                    <p className="text-xs text-text-secondary">raised</p>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-text-secondary">
                    <Heart className="h-3.5 w-3.5 text-primary" />
                    <span>{page.gifts} gifts</span>
                  </div>
                </div>

                {/* CTA */}
                <div className="pt-3 border-t border-border-light">
                  <div className="flex items-center justify-center gap-1.5 text-sm font-medium text-primary">
                    <Gift className="h-3.5 w-3.5" />
                    <span>View Gift Page</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-text-inverse font-semibold rounded-full px-8 py-3.5 text-base transition-colors"
          >
            Create Your Own Gift Page
          </Link>
        </div>
      </div>
    </section>
  );
}
