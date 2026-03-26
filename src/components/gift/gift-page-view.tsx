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
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
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

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const PRESET_AMOUNTS = [15, 25, 50, 100];
const PROJECTION_YEARS = 30;

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
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
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
        {copied ? (
          <Check className="h-3.5 w-3.5 text-primary" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
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
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function GiftPageView({
  giftPage,
  publicData,
}: {
  giftPage: GiftPageData;
  publicData: PublicData;
}) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(50);
  const [customAmount, setCustomAmount] = useState("");
  const [giverName, setGiverName] = useState("");
  const [giverEmail, setGiverEmail] = useState("");
  const [note, setNote] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showAllGifts, setShowAllGifts] = useState(false);

  const amount = isCustom ? parseFloat(customAmount) || 0 : selectedAmount || 0;
  const fund = getFundByTicker(giftPage.fundTicker);
  const projectedValue = fund
    ? calculateGrowth(amount, fund.avgAnnualReturn, PROJECTION_YEARS)
    : 0;

  const totalRaised = publicData.totalRaisedCents / 100;
  const visibleGifts = showAllGifts
    ? publicData.recentGifts
    : publicData.recentGifts.slice(0, 5);

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
          giverName: giverName.trim(),
          giverEmail: giverEmail.trim().toLowerCase(),
          note: note?.trim() || null,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setErrorMessage(
          data.error || "Something went wrong. Please try again."
        );
        setIsProcessing(false);
      }
    } catch {
      setErrorMessage(
        "Connection error. Please check your internet and try again."
      );
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-surface border-b border-border-light">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Sprout className="h-5 w-5 text-primary" />
            <span className="text-base font-bold text-text-primary">
              SeedGift
            </span>
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-text-secondary">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span>Payments protected</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* ============ LEFT COLUMN ============ */}
          <div className="lg:col-span-3 space-y-6">
            {/* Hero: child photo + name */}
            <div>
              <div className="flex items-center gap-4 mb-5">
                <Avatar
                  src={giftPage.childPhotoUrl}
                  alt={giftPage.childName}
                  size="xl"
                />
                <div>
                  <h1 className="text-2xl sm:text-3xl text-text-primary leading-tight">
                    {giftPage.childName}&apos;s {giftPage.eventName}
                  </h1>
                  <p className="text-text-secondary text-sm mt-1">
                    Invested in{" "}
                    <span className="font-medium text-text-primary">
                      {giftPage.fundTicker}
                    </span>{" "}
                    ({giftPage.fundName})
                  </p>
                </div>
              </div>

              {/* Progress bar + stats */}
              <div className="bg-surface rounded-[var(--radius-xl)] shadow-card p-5">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-2xl font-bold text-text-primary">
                    {formatCurrency(totalRaised)}
                  </span>
                  <span className="text-sm text-text-secondary">raised</span>
                </div>
                <ProgressBar
                  raised={totalRaised}
                  goal={Math.max(totalRaised * 2, 500)}
                />
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                    <Heart className="h-3.5 w-3.5" />
                    <span>
                      <strong className="text-text-primary">
                        {publicData.giftCount}
                      </strong>{" "}
                      gift{publicData.giftCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                    <Users className="h-3.5 w-3.5" />
                    <span>from family &amp; friends</span>
                  </div>
                </div>

                {/* Share */}
                <div className="mt-4 pt-4 border-t border-border-light">
                  <ShareButtons slug={giftPage.slug} />
                </div>
              </div>
            </div>

            {/* Organizer / parent info */}
            <div className="bg-surface rounded-[var(--radius-xl)] shadow-card p-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary-light text-primary-dark font-semibold flex items-center justify-center text-sm">
                  {publicData.parentName
                    ? publicData.parentName.charAt(0).toUpperCase()
                    : "P"}
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
                    {publicData.parentName ?? "Parent"}
                    <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                  </p>
                  <p className="text-xs text-text-secondary">
                    Organizer &middot; Parent
                  </p>
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
                  {
                    step: "1",
                    title: "You give",
                    desc: "Choose an amount & contribute",
                  },
                  {
                    step: "2",
                    title: "It's invested",
                    desc: `Funds go into ${giftPage.fundTicker}`,
                  },
                  {
                    step: "3",
                    title: "It grows",
                    desc: "Compounds for years to come",
                  },
                ].map((s) => (
                  <div key={s.step} className="text-center">
                    <div className="h-8 w-8 rounded-full bg-primary text-text-inverse text-sm font-bold flex items-center justify-center mx-auto mb-2">
                      {s.step}
                    </div>
                    <p className="text-xs font-semibold text-text-primary">
                      {s.title}
                    </p>
                    <p className="text-xs text-text-secondary mt-0.5">
                      {s.desc}
                    </p>
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
                      <>
                        Show less <ChevronUp className="h-3.5 w-3.5" />
                      </>
                    ) : (
                      <>
                        See all {publicData.recentGifts.length} gifts{" "}
                        <ChevronDown className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ============ RIGHT COLUMN (sticky form) ============ */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-6 space-y-4">
              {/* Amount picker */}
              <div className="bg-surface rounded-[var(--radius-xl)] shadow-card p-5">
                <h2 className="text-lg font-semibold text-text-primary mb-4 font-[family-name:var(--font-body)]">
                  Choose an amount
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
                      className={`py-2.5 rounded-[var(--radius-md)] text-center font-semibold text-sm transition-colors cursor-pointer ${
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
                          <span className="font-bold">
                            {formatCurrency(projectedValue)}
                          </span>{" "}
                          in {PROJECTION_YEARS} years*
                        </p>
                        <p className="text-xs text-primary-dark/50 mt-0.5">
                          *{(fund.avgAnnualReturn * 100).toFixed(0)}% avg.
                          annual return. Not guaranteed.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Giver info */}
              <div className="bg-surface rounded-[var(--radius-xl)] shadow-card p-5">
                <h2 className="text-lg font-semibold text-text-primary mb-4 font-[family-name:var(--font-body)]">
                  Your details
                </h2>
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

              {/* Error message */}
              {errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded-[var(--radius-md)] p-3">
                  <p className="text-sm text-red-700">{errorMessage}</p>
                </div>
              )}

              {/* Submit */}
              <Button
                size="lg"
                className="w-full text-base py-3.5"
                disabled={
                  amount <= 0 || !giverName || !giverEmail || isProcessing
                }
                isLoading={isProcessing}
                onClick={handleGift}
              >
                Gift {amount > 0 ? formatCurrency(amount) : ""} to{" "}
                {giftPage.childName}
              </Button>

              {/* Trust footer */}
              <div className="flex items-center justify-center gap-4 text-xs text-text-secondary">
                <div className="flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                  <span>Secured by Stripe</span>
                </div>
                <span className="text-border">|</span>
                <Link href="/privacy" className="hover:underline">
                  Privacy
                </Link>
                <span className="text-border">|</span>
                <Link href="/terms" className="hover:underline">
                  Terms
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
