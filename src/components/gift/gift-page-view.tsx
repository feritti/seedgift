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
  Gift,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  calculateGrowth,
  formatCurrency,
} from "@/shared/utils/growth-calculator";
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
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const PRESET_AMOUNTS = [15, 25, 50, 100];
const PROJECTION_YEARS = 30;
const TIP_MIN = 0;
const TIP_MAX = 30;
const TIP_DEFAULT = 15;

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

/* ------------------------------------------------------------------ */
/*  Main Component — Single-Page Gift + Checkout                       */
/* ------------------------------------------------------------------ */

export function GiftPageView({
  giftPage,
  publicData,
}: {
  giftPage: GiftPageData;
  publicData: PublicData;
}) {
  const [showAllGifts, setShowAllGifts] = useState(false);

  // Checkout state
  const [selectedAmount, setSelectedAmount] = useState<number | null>(50);
  const [customAmount, setCustomAmount] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [tipPercent, setTipPercent] = useState(TIP_DEFAULT);
  const [giverName, setGiverName] = useState("");
  const [giverEmail, setGiverEmail] = useState("");
  const [note, setNote] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fund = getFundByTicker(giftPage.fundTicker);
  const totalRaised = publicData.totalRaisedCents / 100;
  const visibleGifts = showAllGifts
    ? publicData.recentGifts
    : publicData.recentGifts.slice(0, 3);

  const amount = isCustom ? parseFloat(customAmount) || 0 : selectedAmount || 0;
  const projectedValue = fund
    ? calculateGrowth(amount, fund.avgAnnualReturn, PROJECTION_YEARS)
    : 0;
  const tipAmount = Math.round(amount * (tipPercent / 100) * 100) / 100;
  const grandTotal = amount + tipAmount;

  const handleGift = async () => {
    setErrorMessage(null);
    const amountCents = Math.round(amount * 100);
    if (amountCents < 100 || amountCents > 1_000_000) {
      setErrorMessage("Amount must be between $1 and $10,000");
      return;
    }
    if (!giverName.trim() || giverName.length > 100) {
      setErrorMessage("Please enter your name (max 100 characters)");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(giverEmail)) {
      setErrorMessage("Please enter a valid email address");
      return;
    }
    if (note && note.length > 500) {
      setErrorMessage("Note must be under 500 characters");
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          giftPageId: giftPage.id,
          amountCents,
          tipCents: Math.round(tipAmount * 100),
          giverName: giverName.trim(),
          giverEmail: giverEmail.trim().toLowerCase(),
          note: note?.trim() || null,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setErrorMessage(data.error || "Something went wrong. Please try again.");
        setIsProcessing(false);
      }
    } catch {
      setErrorMessage("Connection error. Please check your internet and try again.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
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
            className="mx-auto mb-3"
          />
          <h1 className="text-3xl sm:text-4xl text-text-primary leading-tight">
            {giftPage.childName}&apos;s {giftPage.eventName}
          </h1>
        </div>

        {/* Progress + stats + investment — merged card */}
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

          {/* Organizer + fund — compact row */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border-light">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-primary-light text-primary-dark font-semibold flex items-center justify-center text-xs">
                {publicData.parentName ? publicData.parentName.charAt(0).toUpperCase() : "P"}
              </div>
              <p className="text-sm font-medium text-text-primary flex items-center gap-1">
                {publicData.parentName ?? "Parent"}
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-text-secondary">
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
              <span>
                {giftPage.fundTicker} &middot; {fund ? `${(fund.avgAnnualReturn * 100).toFixed(0)}%` : ""} avg. return
              </span>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/*  GIVE A GIFT — Inline Checkout                                */}
        {/* ============================================================ */}

        {/* Amount picker */}
        <div className="bg-surface rounded-[var(--radius-xl)] shadow-card p-5">
          <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2 font-[family-name:var(--font-body)]">
            <Gift className="h-5 w-5 text-primary" />
            Give a Gift
          </h2>

          <div className="grid grid-cols-4 gap-2 mb-3">
            {PRESET_AMOUNTS.map((preset) => (
              <button
                key={preset}
                onClick={() => {
                  setSelectedAmount(preset);
                  setIsCustom(false);
                  setCustomAmount("");
                }}
                className={`py-3 rounded-[var(--radius-md)] text-center font-semibold transition-colors cursor-pointer ${
                  !isCustom && selectedAmount === preset
                    ? "bg-primary text-text-inverse"
                    : "bg-surface-muted text-text-primary hover:bg-primary-light"
                }`}
              >
                ${preset}
              </button>
            ))}
          </div>

          <Input
            placeholder="Custom amount"
            type="number"
            min="1"
            step="1"
            value={customAmount}
            onFocus={() => {
              setIsCustom(true);
              setSelectedAmount(null);
            }}
            onChange={(e) => {
              setCustomAmount(e.target.value);
              setIsCustom(true);
              setSelectedAmount(null);
            }}
          />

          {/* Growth projection */}
          {amount > 0 && fund && (
            <div className="mt-4 bg-primary-light rounded-[var(--radius-md)] p-3">
              <div className="flex items-start gap-2">
                <TrendingUp className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-primary-dark">
                    {formatCurrency(amount)} could grow to{" "}
                    <span className="font-bold">{formatCurrency(projectedValue)}</span> in{" "}
                    {PROJECTION_YEARS} years*
                  </p>
                  <p className="text-xs text-primary-dark/50 mt-0.5">
                    *{(fund.avgAnnualReturn * 100).toFixed(0)}% avg. annual return. Not guaranteed.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Giver info */}
        <div className="bg-surface rounded-[var(--radius-xl)] shadow-card p-5">
          <div className="space-y-3">
            <Input
              id="giverName"
              label="Your Name"
              placeholder="e.g., Grandma Sue"
              required
              value={giverName}
              onChange={(e) => setGiverName(e.target.value)}
            />
            <Input
              id="giverEmail"
              label="Your Email"
              type="email"
              placeholder="sue@example.com"
              required
              value={giverEmail}
              onChange={(e) => setGiverEmail(e.target.value)}
            />
            <div>
              <label
                htmlFor="note"
                className="block text-sm font-medium text-text-primary mb-1.5"
              >
                Add a note (optional)
              </label>
              <textarea
                id="note"
                rows={2}
                placeholder="Happy birthday! Wishing you all the best..."
                className="w-full rounded-[var(--radius-md)] border border-border bg-surface px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Tip section — slider */}
        {amount > 0 && (
          <div className="bg-surface rounded-[var(--radius-xl)] shadow-card p-5">
            <div className="flex items-start justify-between mb-1">
              <div>
                <h3 className="text-sm font-semibold text-text-primary">
                  Tip SeedGift
                </h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  An optional tip helps keep the platform free.
                </p>
              </div>
              <div className="text-right shrink-0 ml-4">
                <p className="text-lg font-bold text-text-primary leading-tight">
                  {formatCurrency(tipAmount)}
                </p>
                <p className="text-xs text-text-secondary">{tipPercent}%</p>
              </div>
            </div>

            <div className="mt-4 relative">
              <input
                type="range"
                min={TIP_MIN}
                max={TIP_MAX}
                step={1}
                value={tipPercent}
                onChange={(e) => setTipPercent(parseInt(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer bg-surface-muted
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:h-6
                  [&::-webkit-slider-thumb]:w-6
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-primary
                  [&::-webkit-slider-thumb]:shadow-md
                  [&::-webkit-slider-thumb]:border-2
                  [&::-webkit-slider-thumb]:border-white
                  [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-webkit-slider-thumb]:transition-transform
                  [&::-webkit-slider-thumb]:hover:scale-110
                  [&::-moz-range-thumb]:h-6
                  [&::-moz-range-thumb]:w-6
                  [&::-moz-range-thumb]:rounded-full
                  [&::-moz-range-thumb]:bg-primary
                  [&::-moz-range-thumb]:shadow-md
                  [&::-moz-range-thumb]:border-2
                  [&::-moz-range-thumb]:border-white
                  [&::-moz-range-thumb]:cursor-pointer"
                style={{
                  background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${(tipPercent / TIP_MAX) * 100}%, var(--color-surface-muted) ${(tipPercent / TIP_MAX) * 100}%, var(--color-surface-muted) 100%)`,
                }}
              />
              <div className="flex justify-between text-xs text-text-secondary mt-1.5">
                <span>0%</span>
                <span>15%</span>
                <span>30%</span>
              </div>
            </div>
          </div>
        )}

        {/* Total summary */}
        {amount > 0 && (
          <div className="bg-surface rounded-[var(--radius-xl)] shadow-card px-5 py-4">
            <div className="flex justify-between text-sm text-text-secondary">
              <span>Gift to {giftPage.childName}</span>
              <span>{formatCurrency(amount)}</span>
            </div>
            {tipAmount > 0 && (
              <div className="flex justify-between text-sm text-text-secondary mt-1.5">
                <span>Tip to SeedGift</span>
                <span>{formatCurrency(tipAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-text-primary mt-3 pt-3 border-t border-border-light">
              <span>Total</span>
              <span>{formatCurrency(grandTotal)}</span>
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-[var(--radius-md)] p-3">
            <p className="text-sm text-red-700">{errorMessage}</p>
          </div>
        )}

        {/* Submit */}
        <Button
          size="lg"
          className="w-full text-lg py-4"
          disabled={amount <= 0 || !giverName || !giverEmail || isProcessing}
          isLoading={isProcessing}
          onClick={handleGift}
        >
          {grandTotal > 0 ? `Pay ${formatCurrency(grandTotal)}` : "Give a Gift"}
        </Button>

        {/* Supporters — social proof below CTA */}
        {publicData.recentGifts.length > 0 && (
          <div className="bg-surface rounded-[var(--radius-xl)] shadow-card p-5">
            <h3 className="text-sm font-semibold text-text-primary mb-1 flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Supporters
            </h3>
            <div className="divide-y divide-border-light">
              {visibleGifts.map((g, i) => (
                <div key={i} className="flex items-center gap-3 py-3">
                  <div className="h-8 w-8 rounded-full bg-primary-light text-primary-dark font-semibold flex items-center justify-center text-xs shrink-0">
                    {g.giverName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {getFirstName(g.giverName)}
                    </p>
                    <p className="text-xs text-text-secondary">{timeAgo(g.createdAt)}</p>
                  </div>
                  <p className="text-sm font-semibold text-text-primary shrink-0">
                    {formatCurrency(g.amountCents / 100)}
                  </p>
                </div>
              ))}
            </div>
            {publicData.recentGifts.length > 3 && (
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
