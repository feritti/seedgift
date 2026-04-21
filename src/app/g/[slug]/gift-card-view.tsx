"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Sprout,
  TrendingUp,
  Heart,
  Copy,
  Check,
  Mail,
  Share2,
  Clock,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  calculateGrowth,
  formatCurrency,
} from "@/shared/utils/growth-calculator";
import { getFundByTicker } from "@/shared/constants/funds";
import type { SentGift } from "@/shared/types/sent-gift";

const PROJECTION_MILESTONES = [1, 5, 10, 18];
const TOY_COMPARE_DEFAULT = 50;

export function GiftCardView({
  sentGift,
  shareUrl,
}: {
  sentGift: SentGift;
  shareUrl: string;
}) {
  const [copied, setCopied] = useState(false);
  const fund = getFundByTicker(sentGift.fundTicker);
  const amountDollars = sentGift.amountCents / 100;

  const projections = useMemo(
    () =>
      fund
        ? PROJECTION_MILESTONES.map((years) => ({
            years,
            value: calculateGrowth(amountDollars, fund.avgAnnualReturn, years),
          }))
        : [],
    [fund, amountDollars]
  );

  const finalProjection = projections[projections.length - 1];
  const maxProjection = projections[projections.length - 1]?.value ?? 0;

  const toyEquivalent = amountDollars || TOY_COMPARE_DEFAULT;
  const toyAfter = finalProjection?.value ?? 0;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // noop
    }
  };

  const mailtoHref = `mailto:?subject=${encodeURIComponent(
    `A SeedGift for ${sentGift.childName}`
  )}&body=${encodeURIComponent(
    `View the SeedGift: ${shareUrl}`
  )}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-light/40 via-background to-background">
      {/* Top bar */}
      <header className="bg-surface/80 backdrop-blur-sm border-b border-border-light">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Sprout className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold text-text-primary">SeedGift</span>
          </Link>
          {sentGift.status === "pending" && (
            <div className="flex items-center gap-1.5 text-xs text-text-secondary bg-surface-muted rounded-full px-3 py-1">
              <Clock className="h-3.5 w-3.5" />
              Processing payment
            </div>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-6">
        {/* The card */}
        <section className="relative bg-surface rounded-[var(--radius-xl)] shadow-card overflow-hidden">
          <div className="bg-gradient-to-br from-primary to-primary-dark px-6 sm:px-10 py-10 text-center text-text-inverse">
            <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-3 py-1 mb-4">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">
                SeedGift · {sentGift.occasion}
              </span>
            </div>
            <p className="text-sm opacity-90 mb-1">For</p>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              {sentGift.childName}
            </h1>
            <p className="text-sm opacity-90 mb-1">From</p>
            <p className="text-xl font-semibold mb-6">{sentGift.giverName}</p>
            <div className="inline-block bg-white/15 rounded-[var(--radius-lg)] px-6 py-4">
              <p className="text-xs opacity-90 mb-1">Gift amount</p>
              <p className="text-4xl font-bold">
                {formatCurrency(amountDollars)}
              </p>
            </div>
          </div>

          {sentGift.message && (
            <div className="px-6 sm:px-10 py-6 border-b border-border-light">
              <p className="text-sm text-text-secondary mb-2 font-medium">
                A note from {sentGift.giverName}:
              </p>
              <blockquote className="text-base text-text-primary italic leading-relaxed whitespace-pre-wrap">
                “{sentGift.message}”
              </blockquote>
            </div>
          )}

          {fund && (
            <div className="px-6 sm:px-10 py-6">
              <p className="text-sm text-text-secondary mb-2 font-medium">
                Invested in
              </p>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light">
                  <TrendingUp className="h-5 w-5 text-primary-dark" />
                </div>
                <div>
                  <p className="font-semibold text-text-primary">
                    {fund.ticker} · {fund.name}
                  </p>
                  <p className="text-sm text-text-secondary leading-relaxed mt-0.5">
                    {fund.description}
                  </p>
                  <p className="text-xs text-text-secondary mt-1">
                    ~{(fund.avgAnnualReturn * 100).toFixed(1)}% avg annual return
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Claim email */}
          <div className="px-6 sm:px-10 py-5 border-t border-border-light bg-surface-muted/50">
            <p className="text-xs text-text-secondary uppercase tracking-wide mb-1">
              Sent to
            </p>
            <p className="text-base font-semibold text-text-primary">
              {sentGift.recipientEmail}
            </p>
            <p className="text-xs text-text-secondary mt-1">
              This email is how you&apos;ll claim and manage the gift.
            </p>
          </div>
        </section>

        {/* Growth projection */}
        {fund && projections.length > 0 && (
          <section className="bg-surface rounded-[var(--radius-xl)] shadow-card p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-text-primary mb-1">
              How this could grow
            </h2>
            <p className="text-sm text-text-secondary mb-6">
              Projected value if the {formatCurrency(amountDollars)} is invested in{" "}
              {fund.ticker} at its historical average return.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {projections.map((p) => {
                const isFinal = p.years === finalProjection?.years;
                const height = Math.max(10, (p.value / maxProjection) * 100);
                return (
                  <div
                    key={p.years}
                    className={`rounded-[var(--radius-md)] p-4 ${
                      isFinal ? "bg-primary-light" : "bg-surface-muted"
                    }`}
                  >
                    <p className="text-xs text-text-secondary mb-1">
                      In {p.years} year{p.years === 1 ? "" : "s"}
                    </p>
                    <p
                      className={`text-xl sm:text-2xl font-bold ${
                        isFinal ? "text-primary-dark" : "text-text-primary"
                      }`}
                    >
                      {formatCurrency(p.value)}
                    </p>
                    <div className="mt-3 h-1.5 bg-white/60 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          isFinal ? "bg-primary" : "bg-primary/60"
                        }`}
                        style={{ width: `${height}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-text-secondary mt-4">
              Past performance does not guarantee future results. Projections use
              the fund&apos;s historical average; actual returns will vary.
            </p>
          </section>
        )}

        {/* Why not a toy */}
        <section className="bg-surface rounded-[var(--radius-xl)] shadow-card p-6 sm:p-8">
          <div className="flex items-start gap-3 mb-4">
            <Heart className="h-6 w-6 text-primary shrink-0 mt-1" />
            <div>
              <h2 className="text-xl font-semibold text-text-primary">
                Why this matters
              </h2>
              <p className="text-sm text-text-secondary mt-1">
                Toys get forgotten. Investments compound.
              </p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="bg-surface-muted rounded-[var(--radius-md)] p-5">
              <p className="text-xs uppercase tracking-wide text-text-secondary mb-2">
                A {formatCurrency(toyEquivalent)} toy
              </p>
              <p className="text-2xl font-bold text-text-primary mb-1">
                {formatCurrency(0)}
              </p>
              <p className="text-sm text-text-secondary">
                in 18 years — donated, broken, or forgotten.
              </p>
            </div>
            <div className="bg-primary-light rounded-[var(--radius-md)] p-5">
              <p className="text-xs uppercase tracking-wide text-primary-dark mb-2">
                {formatCurrency(toyEquivalent)} invested in {fund?.ticker ?? "VOO"}
              </p>
              <p className="text-2xl font-bold text-primary-dark mb-1">
                {formatCurrency(toyAfter)}
              </p>
              <p className="text-sm text-primary-dark/80">
                in 18 years — a real head start.
              </p>
            </div>
          </div>
        </section>

        {/* Claim CTA — Phase 1 inert */}
        <section className="bg-primary rounded-[var(--radius-xl)] p-6 sm:p-8 text-text-inverse text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">
            Ready to claim this gift?
          </h2>
          <p className="text-base opacity-90 mb-5 max-w-xl mx-auto">
            We&apos;re opening claims for gifted funds soon. We&apos;ll email{" "}
            <span className="font-semibold">{sentGift.recipientEmail}</span> as
            soon as it&apos;s ready — no action needed today.
          </p>
          <Link href="/contact">
            <Button variant="secondary" size="md" className="bg-white border-white">
              <Mail className="h-4 w-4 mr-1.5" />
              Questions? Contact us
            </Button>
          </Link>
        </section>

        {/* Share */}
        <section className="bg-surface rounded-[var(--radius-xl)] shadow-card p-6">
          <div className="flex items-center gap-2 mb-3">
            <Share2 className="h-5 w-5 text-text-secondary" />
            <h2 className="text-base font-semibold text-text-primary">
              Share this gift
            </h2>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 min-w-0 bg-surface-muted rounded-[var(--radius-md)] px-4 py-2.5 text-sm text-text-primary font-mono truncate">
              {shareUrl}
            </div>
            <Button onClick={copyLink} variant={copied ? "secondary" : "primary"} size="md">
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-1.5" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1.5" />
                  Copy link
                </>
              )}
            </Button>
            <a href={mailtoHref}>
              <Button variant="secondary" size="md">
                <Mail className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </section>

        <div className="pt-2 pb-4 text-center">
          <Link href="/send-gift">
            <Button variant="ghost" size="sm">
              Send a SeedGift to someone you love →
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
