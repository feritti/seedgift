"use client";

import { useState } from "react";
import { BookOpen, TrendingUp, Shield, Sparkles, GraduationCap, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion } from "@/components/ui/accordion";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

type RiskLevel = "Low" | "Medium" | "High" | "Very High" | "Tax-Advantaged";
type FilterKey = "all" | "index" | "crypto" | "education" | "lower" | "higher";

interface InvestmentOption {
  ticker: string;
  name: string;
  issuer: string;
  risk: RiskLevel;
  description: string;
  stats: { label: string; value: string }[];
  tags: string[];
  filters: FilterKey[];
}

const INVESTMENTS: InvestmentOption[] = [
  {
    ticker: "VOO",
    name: "S&P 500 Index Fund",
    issuer: "Vanguard",
    risk: "Medium",
    description:
      "The most popular way to invest in America's 500 largest companies. A single gift buys a tiny slice of Apple, Microsoft, Amazon, and hundreds more. Ideal for long-term, set-it-and-forget-it growth.",
    stats: [
      { label: "Expense Ratio", value: "0.03%" },
      { label: "10-Yr Avg Return", value: "~13%" },
      { label: "Holdings", value: "500 companies" },
    ],
    tags: ["Large Cap", "Passive", "Most Popular"],
    filters: ["index", "lower"],
  },
  {
    ticker: "VTI",
    name: "Total US Stock Market",
    issuer: "Vanguard",
    risk: "Medium",
    description:
      "Own a piece of virtually every publicly traded company in the US — large, mid, and small. Broader than the S&P 500, giving your gift exposure to the entire American economy.",
    stats: [
      { label: "Expense Ratio", value: "0.03%" },
      { label: "10-Yr Avg Return", value: "~12.8%" },
      { label: "Holdings", value: "3,700+ companies" },
    ],
    tags: ["Total Market", "Passive", "Diversified"],
    filters: ["index", "lower"],
  },
  {
    ticker: "VT",
    name: "Total World Stock Market",
    issuer: "Vanguard",
    risk: "Medium",
    description:
      "The ultimate diversifier — one fund covering stocks in the US, Europe, Asia, and emerging markets. A great choice if you want the child's gift spread across the global economy.",
    stats: [
      { label: "Expense Ratio", value: "0.07%" },
      { label: "10-Yr Avg Return", value: "~9.5%" },
      { label: "Holdings", value: "9,000+ across 50 countries" },
    ],
    tags: ["Global", "Passive", "Diversified"],
    filters: ["index", "lower"],
  },
  {
    ticker: "QQQ",
    name: "Nasdaq-100 Index",
    issuer: "Invesco",
    risk: "High",
    description:
      "Concentrated in the 100 largest non-financial Nasdaq companies — heavy on technology giants. Higher potential returns but with bigger swings. Best for a long time horizon where volatility smooths out.",
    stats: [
      { label: "Expense Ratio", value: "0.20%" },
      { label: "10-Yr Avg Return", value: "~18%" },
      { label: "Holdings", value: "100 companies" },
    ],
    tags: ["Tech-Heavy", "Growth", "Concentrated"],
    filters: ["index", "higher"],
  },
  {
    ticker: "SCHB",
    name: "Schwab US Broad Market",
    issuer: "Charles Schwab",
    risk: "Medium",
    description:
      "Similar to VTI but from Schwab — a low-cost way to own a broad slice of the US stock market. One of the cheapest index funds available, keeping more of the gift working for the child.",
    stats: [
      { label: "Expense Ratio", value: "0.03%" },
      { label: "10-Yr Avg Return", value: "~12.7%" },
      { label: "Holdings", value: "2,500+ companies" },
    ],
    tags: ["Broad Market", "Passive", "Low Cost"],
    filters: ["index", "lower"],
  },
  {
    ticker: "BTC",
    name: "Bitcoin",
    issuer: "Decentralized",
    risk: "Very High",
    description:
      "The original cryptocurrency — a digital store of value with a fixed supply of 21 million coins. High growth potential over decades, but expect significant price swings along the way. Only for those comfortable with volatility.",
    stats: [
      { label: "Asset Type", value: "Digital currency" },
      { label: "Max Supply", value: "21M coins" },
      { label: "Since", value: "2009" },
    ],
    tags: ["Cryptocurrency", "Digital Asset", "High Growth"],
    filters: ["crypto", "higher"],
  },
  {
    ticker: "ETH",
    name: "Ethereum",
    issuer: "Decentralized",
    risk: "Very High",
    description:
      "More than a currency — Ethereum powers smart contracts, DeFi, and thousands of decentralized applications. A bet on the future of programmable money and blockchain technology.",
    stats: [
      { label: "Asset Type", value: "Smart contract platform" },
      { label: "Use Case", value: "DeFi & dApps" },
      { label: "Since", value: "2015" },
    ],
    tags: ["Cryptocurrency", "Smart Contracts", "DeFi"],
    filters: ["crypto", "higher"],
  },
  {
    ticker: "529",
    name: "529 College Savings Plan",
    issuer: "State-Sponsored",
    risk: "Tax-Advantaged",
    description:
      "A tax-advantaged account built specifically for education expenses — from K-12 tuition to college and beyond. Contributions grow tax-free when used for qualified education costs. Unused funds can now roll over into a Roth IRA.",
    stats: [
      { label: "Tax Benefit", value: "Tax-free growth" },
      { label: "Annual Gift Limit", value: "$19K/year" },
      { label: "Use", value: "Education expenses" },
    ],
    tags: ["Education", "Tax-Free", "College Savings"],
    filters: ["education", "lower"],
  },
];

const FILTERS: { key: FilterKey; label: string; icon: React.ElementType }[] = [
  { key: "all", label: "All", icon: Sparkles },
  { key: "index", label: "Index Funds", icon: TrendingUp },
  { key: "crypto", label: "Crypto", icon: Shield },
  { key: "education", label: "Education", icon: GraduationCap },
  { key: "lower", label: "Lower Risk", icon: Shield },
  { key: "higher", label: "Higher Risk", icon: TrendingUp },
];

const RESOURCE_FAQ = [
  {
    question: "Can I split a gift across multiple investments?",
    answer:
      "Currently each gift page is tied to one investment option chosen by the parent. If a parent wants to diversify, they can create multiple gift pages — one for each investment — and share different links with different family members.",
  },
  {
    question: "What's the difference between VTI and VOO?",
    answer:
      "VOO tracks the S&P 500 (the 500 largest US companies), while VTI tracks the total US stock market (~3,700 companies including small and mid-cap). VTI is slightly more diversified; VOO is more concentrated in large companies. Both have identical expense ratios (0.03%) and very similar long-term returns.",
  },
  {
    question: "Is crypto appropriate for a child's account?",
    answer:
      "That depends on the family's risk tolerance and time horizon. A child with 18+ years before they'd use the funds has time to ride out volatility. That said, crypto is significantly more volatile than index funds. Many parents choose to allocate a small portion to crypto alongside a core index fund holding.",
  },
  {
    question: "What's the difference between a 529 and a custodial (UTMA) account?",
    answer:
      "A 529 offers tax-free growth but must be used for education expenses. A UTMA custodial account has no restrictions on use — the child gets full control at 18-21 (depending on state). The 529 is better for families committed to education funding; a UTMA offers more flexibility but fewer tax benefits.",
  },
  {
    question: "What if the child doesn't go to college?",
    answer:
      "Thanks to the SECURE 2.0 Act, unused 529 funds can now be rolled over into a Roth IRA for the beneficiary (up to $35,000 lifetime, subject to annual Roth contribution limits). The 529 must have been open for at least 15 years. This makes the 529 much more flexible than it used to be.",
  },
  {
    question: "Who controls the investments — the gift-giver or the parent?",
    answer:
      "The parent controls everything. They choose the investment option when creating the gift page, and they receive the funds into their connected Stripe account. The gift-giver simply contributes money — they don't make investment decisions or have access to the account.",
  },
];

const riskColors: Record<RiskLevel, string> = {
  Low: "bg-emerald-100 text-emerald-700",
  Medium: "bg-amber-100 text-amber-700",
  High: "bg-orange-100 text-orange-700",
  "Very High": "bg-red-100 text-red-700",
  "Tax-Advantaged": "bg-blue-100 text-blue-700",
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ResourcesPage() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  const filtered =
    activeFilter === "all"
      ? INVESTMENTS
      : INVESTMENTS.filter((i) => i.filters.includes(activeFilter));

  return (
    <div className="-mx-4 -mt-4 md:-mx-6 md:-mt-6 lg:-mx-8 lg:-mt-8">
      {/* Hero */}
      <div className="bg-text-primary px-6 py-14 sm:py-20">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-5">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl text-text-inverse mb-4">
            Investment Resources
          </h1>
          <p className="text-lg text-text-inverse/70 max-w-2xl mx-auto leading-relaxed">
            Understand every option before you pick one. Each investment below is
            available on SeedGift — parents choose, givers contribute, and the
            money grows over time.
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-surface border-b border-border-light px-6 py-4 sticky top-0 z-10 md:top-0">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                  activeFilter === f.key
                    ? "bg-primary text-text-inverse"
                    : "bg-surface-muted text-text-secondary hover:text-text-primary hover:bg-border-light"
                }`}
              >
                <f.icon className="h-3.5 w-3.5" />
                {f.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-text-secondary mt-2">
            {filtered.length} option{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Card grid */}
      <div className="px-6 py-10">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((inv, i) => (
              <Card
                key={inv.ticker}
                className="flex flex-col animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${i * 80}ms`, animationFillMode: "both" }}
              >
                <CardContent className="flex flex-col flex-1">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-2xl font-bold text-primary leading-none">
                        {inv.ticker}
                      </h3>
                      <p className="text-sm font-semibold text-text-primary mt-1">
                        {inv.name}
                      </p>
                      <p className="text-xs text-text-secondary">{inv.issuer}</p>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${riskColors[inv.risk]}`}
                    >
                      {inv.risk}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-text-secondary leading-relaxed mb-5">
                    {inv.description}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    {inv.stats.map((s) => (
                      <div
                        key={s.label}
                        className="bg-surface-muted rounded-[var(--radius-md)] p-3 text-center"
                      >
                        <p className="text-xs text-text-secondary mb-0.5">
                          {s.label}
                        </p>
                        <p className="text-sm font-bold text-text-primary">
                          {s.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {inv.tags.map((tag) => (
                      <Badge key={tag}>{tag}</Badge>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className="mt-auto pt-2">
                    <Link href="/gift-pages/new">
                      <Button variant="secondary" size="sm" className="w-full">
                        Select {inv.ticker} for a gift page
                        <ArrowRight className="h-4 w-4 ml-1.5" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-text-primary px-6 py-16 sm:py-20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-primary tracking-wide uppercase mb-3">
              Common Questions
            </p>
            <h2 className="text-3xl sm:text-4xl text-text-inverse">
              Investment FAQ
            </h2>
          </div>
          <div className="[&_button]:text-text-inverse [&_span]:text-text-inverse [&_p]:text-text-inverse/70 [&_svg]:text-text-inverse/60 divide-text-inverse/10">
            <Accordion items={RESOURCE_FAQ} />
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-surface-muted px-6 py-8">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs text-text-secondary leading-relaxed">
            <strong>Disclaimer:</strong> SeedGift is not a financial advisor and
            does not provide investment advice. The information on this page is
            for educational purposes only. Past performance does not guarantee
            future results. All investments carry risk, including the possible
            loss of principal. Projected returns are based on historical averages
            and are not guaranteed. Consult a qualified financial advisor before
            making investment decisions.
          </p>
        </div>
      </div>
    </div>
  );
}
