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
    <div className="w-full h-2.5 bg-surface-muted rounded-full overflow-hidden">
      <div
        className="h-full bg-primary rounded-full transition-all duration-500"
        style={{ width: `${Math.max(pct, 3)}%` }}
      />
    </div>
  );
}

function ShareButtons({ slug, childName }: { slug: string; childName: string }) {
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
        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium bg-surface-muted text-text-secondary hover:text-text-primary hover:bg-border-light transition-colors cursor-pointer"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? "Copied!" : "Copy Link"}
      </button>
      <a
        href={`sms:&body=${encodeURIComponent(`Invest in ${childName}'s future! ${url}`)}`}
        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium bg-surface-muted text-text-secondary hover:text-text-primary hover:bg-border-light transition-colors"
      >
        <Share2 className="h-3.5 w-3.5" />
        Text
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
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="bg-surface border-b border-border-light sticky top-0 z-20">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Sprout className="h-5 w-5 text-primary" />
            <span className="text-base font-bold text-text-primary">SeedGift</span>
          </Link>
          <ShareButtons slug={giftPage.slug} childName={giftPage.childName} />
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-8 space-y-5">
        {/* Hero */}
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
        </div>

        {/* Progress + stats — combined in one tight card */}
        <div className="bg-surface rounded-[var(--radius-xl)] shadow-card p-5">
          <div className="flex items-baseline justify-between mb-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-text-primary">
                {formatCurrency(totalRaised)}
              </span>
              <span className="text-sm text-text-secondary">raised</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-text-secondary">
              <Heart className="h-3.5 w-3.5 text-primary" />
              <span>
                {publicData.giftCount} gift{publicData.giftCount !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
          <ProgressBar raised={totalRaised} goal={Math.max(totalRaised * 2, 500)} />

          {/* Organizer row */}
          <div className="flex items-center gap-2.5 mt-4 pt-4 border-t border-border-light">
            <div className="h-8 w-8 rounded-full bg-primary-light text-primary-dark font-semibold flex items-center justify-center text-xs">
              {publicData.parentName ? publicData.parentName.charAt(0).toUpperCase() : "P"}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-text-primary flex items-center gap-1">
                {publicData.parentName ?? "Parent"}
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              </p>
            </div>
            <span className="text-xs text-text-secondary">Organizer</span>
          </div>
        </div>

        {/* Investment badge */}
        <div className="flex items-center gap-3 bg-surface rounded-[var(--radius-xl)] shadow-card p-4">
          <div className="h-10 w-10 rounded-[var(--radius-md)] bg-primary-light flex items-center justify-center shrink-0">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary">
              Invested in {giftPage.fundTicker}
            </p>
            <p className="text-xs text-text-secondary truncate">
              {giftPage.fundName}
              {fund && ` · ${(fund.avgAnnualReturn * 100).toFixed(1)}% avg. annual return`}
            </p>
          </div>
        </div>

        {/* How it works — horizontal steps */}
        <div className="bg-surface rounded-[var(--radius-xl)] shadow-card p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Info className="h-4 w-4 text-primary" />
            How It Works
          </h3>
          <div className="flex items-start">
            {[
              { step: "1", title: "You give", desc: "Pick an amount" },
              { step: "2", title: "It's invested", desc: `Goes into ${giftPage.fundTicker}` },
              { step: "3", title: "It grows", desc: "Compounds over time" },
            ].map((s, i) => (
              <div key={s.step} className="flex-1 text-center relative">
                {i < 2 && (
                  <div className="absolute top-4 left-[60%] right-0 h-px bg-border" />
                )}
                <div className="h-8 w-8 rounded-full bg-primary text-text-inverse text-sm font-bold flex items-center justify-center mx-auto mb-2 relative z-10">
                  {s.step}
                </div>
                <p className="text-xs font-semibold text-text-primary">{s.title}</p>
                <p className="text-xs text-text-secondary mt-0.5">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent gifts */}
        {publicData.recentGifts.length > 0 && (
          <div className="bg-surface rounded-[var(--radius-xl)] shadow-card p-5">
            <h3 className="text-sm font-semibold text-text-primary mb-1 flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Supporters
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

        {/* Trust footer */}
        <div className="flex items-center justify-center gap-4 text-xs text-text-secondary pt-2">
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

      {/* Sticky bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-surface border-t border-border-light">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary truncate">
              {giftPage.childName}&apos;s {giftPage.eventName}
            </p>
            <p className="text-xs text-text-secondary">
              {formatCurrency(totalRaised)} raised &middot; {publicData.giftCount} gift{publicData.giftCount !== 1 ? "s" : ""}
            </p>
          </div>
          <Link
            href={`/gift/${giftPage.slug}/donate`}
            className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-text-inverse font-semibold rounded-full px-6 py-3 text-base transition-colors shrink-0"
          >
            <Gift className="h-4.5 w-4.5" />
            Give a Gift
          </Link>
        </div>
      </div>
    </div>
  );
}
