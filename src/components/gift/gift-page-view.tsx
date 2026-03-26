"use client";

import { useState } from "react";
import {
  Sprout,
  TrendingUp,
  ShieldCheck,
  Share2,
  Copy,
  Check,
  Heart,
  Users,
  Info,
  Gift,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { formatCurrency } from "@/shared/utils/growth-calculator";
import { getFundByTicker } from "@/shared/constants/funds";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface GiftPageData {
  id: string;
  slug: string;
  childName: string;
  childPhotoUrl: string | null;
  childDob: string | null;
  eventName: string;
  fundTicker: string;
  fundName: string;
  status: string;
}

interface PublicData {
  recentGifts: {
    giverName: string;
    amountCents: number;
    createdAt: string;
  }[];
  totalRaisedCents: number;
  giftCount: number;
  parentName: string | null;
}

export type { GiftPageData, PublicData };

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
}

function getFirstName(name: string): string {
  return name.split(" ")[0];
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function ProgressBar({ raised, goal }: { raised: number; goal: number }) {
  const pct = goal > 0 ? Math.min((raised / goal) * 100, 100) : 0;
  return (
    <div className="w-full h-2 bg-surface-muted rounded-full overflow-hidden">
      <div
        className="h-full bg-primary rounded-full transition-all duration-500"
        style={{ width: `${Math.max(pct, 2)}%` }}
      />
    </div>
  );
}

function ShareButtons({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);
  const url = `https://www.seedgift.xyz/gift/${slug}`;

  const copyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={copyLink}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-surface-muted text-text-secondary hover:text-text-primary hover:bg-border-light transition-colors cursor-pointer"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? "Copied!" : "Copy Link"}
      </button>
      <a
        href={`sms:&body=Help invest in a child's future! ${url}`}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-surface-muted text-text-secondary hover:text-text-primary hover:bg-border-light transition-colors"
      >
        <Share2 className="h-3.5 w-3.5" />
        Text
      </a>
      <a
        href={`mailto:?subject=Gift for a child's future&body=Help invest in a child's future! ${url}`}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-surface-muted text-text-secondary hover:text-text-primary hover:bg-border-light transition-colors"
      >
        <Share2 className="h-3.5 w-3.5" />
        Email
      </a>
    </div>
  );
}

function RecentGiftItem({
  gift,
}: {
  gift: { giverName: string; amountCents: number; createdAt: string };
}) {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="h-9 w-9 rounded-full bg-primary-light text-primary-dark font-semibold flex items-center justify-center text-sm shrink-0">
        {gift.giverName.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary truncate">
          {getFirstName(gift.giverName)}
        </p>
        <p className="text-xs text-text-secondary">{timeAgo(gift.createdAt)}</p>
      </div>
      <p className="text-sm font-semibold text-text-primary shrink-0">
        {formatCurrency(gift.amountCents / 100)}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component — Story / Trust Page                                */
/* ------------------------------------------------------------------ */

export function GiftPageView({
  giftPage,
  publicData,
}: {
  giftPage: GiftPageData;
  publicData: PublicData;
}) {
  const [showAllGifts, setShowAllGifts] = useState(false);

  const fund = getFundByTicker(giftPage.fundTicker);
  const totalRaised = publicData.totalRaisedCents / 100;
  const visibleGifts = showAllGifts
    ? publicData.recentGifts
    : publicData.recentGifts.slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-surface border-b border-border-light">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Sprout className="h-5 w-5 text-primary" />
            <span className="text-base font-bold text-text-primary">SeedGift</span>
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-text-secondary">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span>Payments protected</span>
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-8 space-y-6">
        {/* Hero: child photo + name */}
        <div className="text-center">
          <Avatar
            src={giftPage.childPhotoUrl}
            alt={giftPage.childName}
            size="xl"
            className="mx-auto mb-4"
          />
          <h1 className="text-3xl sm:text-4xl text-text-primary leading-tight">
            {giftPage.childName}&apos;s {giftPage.eventName}
          </h1>
          <p className="text-text-secondary mt-2">
            Give a gift that grows &middot; Invested in{" "}
            <span className="font-medium text-text-primary">{giftPage.fundTicker}</span>{" "}
            ({giftPage.fundName})
          </p>
        </div>

        {/* Progress bar + stats */}
        <div className="bg-surface rounded-[var(--radius-xl)] shadow-card p-5">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-2xl font-bold text-text-primary">
              {formatCurrency(totalRaised)}
            </span>
            <span className="text-sm text-text-secondary">raised</span>
          </div>
          <ProgressBar raised={totalRaised} goal={Math.max(totalRaised * 2, 500)} />
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5 text-sm text-text-secondary">
              <Heart className="h-3.5 w-3.5" />
              <span>
                <strong className="text-text-primary">{publicData.giftCount}</strong>{" "}
                gift{publicData.giftCount !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-text-secondary">
              <Users className="h-3.5 w-3.5" />
              <span>from family &amp; friends</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border-light">
            <ShareButtons slug={giftPage.slug} />
          </div>
        </div>

        {/* Big CTA */}
        <Link href={`/gift/${giftPage.slug}/donate`}>
          <Button size="lg" className="w-full text-lg py-4">
            <Gift className="h-5 w-5 mr-2" />
            Give a Gift
          </Button>
        </Link>

        {/* Organizer / parent info */}
        <div className="bg-surface rounded-[var(--radius-xl)] shadow-card p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary-light text-primary-dark font-semibold flex items-center justify-center text-sm">
              {publicData.parentName ? publicData.parentName.charAt(0).toUpperCase() : "P"}
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
                {publicData.parentName ?? "Parent"}
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              </p>
              <p className="text-xs text-text-secondary">Organizer &middot; Parent</p>
            </div>
          </div>
        </div>

        {/* How it works mini-explainer */}
        <div className="bg-surface rounded-[var(--radius-xl)] shadow-card p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Info className="h-4 w-4 text-primary" />
            How SeedGift Works
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { step: "1", title: "You give", desc: "Choose an amount & contribute" },
              { step: "2", title: "It's invested", desc: `Funds go into ${giftPage.fundTicker}` },
              { step: "3", title: "It grows", desc: "Compounds for years to come" },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="h-8 w-8 rounded-full bg-primary text-text-inverse text-sm font-bold flex items-center justify-center mx-auto mb-2">
                  {s.step}
                </div>
                <p className="text-xs font-semibold text-text-primary">{s.title}</p>
                <p className="text-xs text-text-secondary mt-0.5">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Fund info card */}
        {fund && (
          <div className="bg-surface rounded-[var(--radius-xl)] shadow-card p-5">
            <h3 className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              About {giftPage.fundTicker}
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed mb-3">
              {fund.description}
            </p>
            <div className="flex gap-4 text-xs text-text-secondary">
              <span>
                Avg. return:{" "}
                <strong className="text-text-primary">
                  {(fund.avgAnnualReturn * 100).toFixed(1)}%/yr
                </strong>
              </span>
              <span>
                Category:{" "}
                <strong className="text-text-primary capitalize">
                  {fund.category.replace("-", " ")}
                </strong>
              </span>
            </div>
          </div>
        )}

        {/* Recent gifts feed */}
        {publicData.recentGifts.length > 0 && (
          <div className="bg-surface rounded-[var(--radius-xl)] shadow-card p-5">
            <h3 className="text-sm font-semibold text-text-primary mb-1 flex items-center gap-2">
              <Gift className="h-4 w-4 text-primary" />
              Recent Gifts
            </h3>
            <div className="divide-y divide-border-light">
              {visibleGifts.map((g, i) => (
                <RecentGiftItem key={i} gift={g} />
              ))}
            </div>
            {publicData.recentGifts.length > 5 && (
              <button
                onClick={() => setShowAllGifts(!showAllGifts)}
                className="text-sm text-primary font-medium mt-2 flex items-center gap-1 cursor-pointer hover:underline"
              >
                {showAllGifts ? (
                  <>Show less <ChevronUp className="h-3.5 w-3.5" /></>
                ) : (
                  <>See all {publicData.recentGifts.length} gifts <ChevronDown className="h-3.5 w-3.5" /></>
                )}
              </button>
            )}
          </div>
        )}

        {/* Bottom CTA */}
        <Link href={`/gift/${giftPage.slug}/donate`}>
          <Button size="lg" className="w-full text-lg py-4">
            <Gift className="h-5 w-5 mr-2" />
            Give a Gift
          </Button>
        </Link>

        {/* Trust footer */}
        <div className="flex items-center justify-center gap-4 text-xs text-text-secondary pb-4">
          <div className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span>Secured by Stripe</span>
          </div>
          <span className="text-border">|</span>
          <Link href="/privacy" className="hover:underline">Privacy</Link>
          <span className="text-border">|</span>
          <Link href="/terms" className="hover:underline">Terms</Link>
        </div>
      </main>
    </div>
  );
}
