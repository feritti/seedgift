"use client";

import { useState } from "react";
import {
  Sprout,
  TrendingUp,
  ShieldCheck,
  ArrowLeft,
  Heart,
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
import type { GiftPageData, PublicData } from "./gift-page-view";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const PRESET_AMOUNTS = [15, 25, 50, 100];
const PROJECTION_YEARS = 30;
type TipOption = "15" | "20" | "25" | "custom" | "none";

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function GiftCheckoutView({
  giftPage,
  publicData,
}: {
  giftPage: GiftPageData;
  publicData: PublicData;
}) {
  // Amount
  const [selectedAmount, setSelectedAmount] = useState<number | null>(50);
  const [customAmount, setCustomAmount] = useState("");
  const [isCustom, setIsCustom] = useState(false);

  // Tip
  const [tipOption, setTipOption] = useState<TipOption>("15");
  const [customTip, setCustomTip] = useState("");

  // Giver info
  const [giverName, setGiverName] = useState("");
  const [giverEmail, setGiverEmail] = useState("");
  const [note, setNote] = useState("");

  // UI state
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const amount = isCustom ? parseFloat(customAmount) || 0 : selectedAmount || 0;
  const fund = getFundByTicker(giftPage.fundTicker);
  const projectedValue = fund
    ? calculateGrowth(amount, fund.avgAnnualReturn, PROJECTION_YEARS)
    : 0;

  const tipAmount =
    tipOption === "none"
      ? 0
      : tipOption === "custom"
        ? parseFloat(customTip) || 0
        : Math.round(amount * (parseInt(tipOption) / 100) * 100) / 100;
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
      <header className="bg-surface border-b border-border-light">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href={`/gift/${giftPage.slug}`}
            className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <div className="flex items-center gap-2">
            <Sprout className="h-5 w-5 text-primary" />
            <span className="text-base font-bold text-text-primary">SeedGift</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-text-secondary">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span>Secure</span>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8 space-y-5">
        {/* Mini context — who you're giving to */}
        <div className="flex items-center gap-3 bg-surface rounded-[var(--radius-xl)] shadow-card p-4">
          <Avatar
            src={giftPage.childPhotoUrl}
            alt={giftPage.childName}
            size="lg"
          />
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold text-text-primary truncate">
              {giftPage.childName}&apos;s {giftPage.eventName}
            </p>
            <p className="text-xs text-text-secondary">
              {giftPage.fundTicker} &middot; {formatCurrency(publicData.totalRaisedCents / 100)} raised
              &middot; {publicData.giftCount} gift{publicData.giftCount !== 1 ? "s" : ""}
            </p>
          </div>
          <Heart className="h-5 w-5 text-primary shrink-0" />
        </div>

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

        {/* Tip section */}
        {amount > 0 && (
          <div className="bg-surface rounded-[var(--radius-xl)] shadow-card p-5">
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-text-primary">Tip SeedGift</h3>
              <p className="text-xs text-text-secondary mt-0.5">
                SeedGift doesn&apos;t charge fees. An optional tip helps us keep the
                platform free for families.
              </p>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-3">
              {(
                [
                  { key: "15" as TipOption, label: "15%" },
                  { key: "20" as TipOption, label: "20%" },
                  { key: "25" as TipOption, label: "25%" },
                  { key: "none" as TipOption, label: "None" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => {
                    setTipOption(opt.key);
                    setCustomTip("");
                  }}
                  className={`py-2.5 rounded-[var(--radius-md)] text-center text-xs font-semibold transition-colors cursor-pointer ${
                    tipOption === opt.key
                      ? "bg-primary text-text-inverse"
                      : "bg-surface-muted text-text-primary hover:bg-primary-light"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setTipOption("custom")}
              className={`w-full text-left text-xs font-medium px-3 py-2 rounded-[var(--radius-md)] transition-colors cursor-pointer ${
                tipOption === "custom"
                  ? "bg-primary-light text-primary-dark"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Enter custom tip
            </button>

            {tipOption === "custom" && (
              <div className="mt-2">
                <Input
                  placeholder="Custom tip amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={customTip}
                  onChange={(e) => setCustomTip(e.target.value)}
                />
              </div>
            )}

            {tipAmount > 0 && (
              <p className="text-xs text-text-secondary mt-2">
                Your tip: {formatCurrency(tipAmount)}
              </p>
            )}
          </div>
        )}

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
          {grandTotal > 0 ? `Pay ${formatCurrency(grandTotal)}` : `Give a Gift`}
        </Button>

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
