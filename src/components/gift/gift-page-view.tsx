"use client";

import { useState } from "react";
import { Sprout, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { calculateGrowth, formatCurrency } from "@/shared/utils/growth-calculator";
import { getFundByTicker } from "@/shared/constants/funds";

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

const PRESET_AMOUNTS = [15, 25, 50, 100];
const PROJECTION_YEARS = 30;

export function GiftPageView({ giftPage }: { giftPage: GiftPageData }) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(50);
  const [customAmount, setCustomAmount] = useState("");
  const [giverName, setGiverName] = useState("");
  const [giverEmail, setGiverEmail] = useState("");
  const [note, setNote] = useState("");
  const [isCustom, setIsCustom] = useState(false);

  const amount = isCustom ? parseFloat(customAmount) || 0 : selectedAmount || 0;
  const fund = getFundByTicker(giftPage.fundTicker);
  const projectedValue = fund
    ? calculateGrowth(amount, fund.avgAnnualReturn, PROJECTION_YEARS)
    : 0;

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGift = async () => {
    setErrorMessage(null);

    // Client-side validation
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
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-center gap-2">
          <Sprout className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold text-text-primary">SeedGift</span>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-10">
        {/* Child info */}
        <div className="text-center mb-10">
          <Avatar
            src={giftPage.childPhotoUrl}
            alt={giftPage.childName}
            size="xl"
            className="mx-auto mb-4"
          />
          <h1 className="text-3xl text-text-primary mb-1">
            {giftPage.childName}&apos;s {giftPage.eventName}
          </h1>
          <p className="text-text-secondary">
            Give a gift that grows &middot; Invested in{" "}
            <span className="font-medium text-text-primary">
              {giftPage.fundTicker}
            </span>{" "}
            ({giftPage.fundName})
          </p>
        </div>

        {/* Amount picker */}
        <div className="bg-surface rounded-[var(--radius-xl)] shadow-card p-6 mb-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4 font-[family-name:var(--font-body)]">
            Choose an amount
          </h2>

          <div className="grid grid-cols-4 gap-3 mb-4">
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

          <div>
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
          </div>

          {/* Growth projection chart */}
          {amount > 0 && fund && (() => {
            const milestones = [
              { year: 0, label: "Today" },
              { year: 5, label: "5 yr" },
              { year: 10, label: "10 yr" },
              { year: 20, label: "20 yr" },
              { year: 30, label: "30 yr" },
            ];
            const values = milestones.map((m) => ({
              ...m,
              value: calculateGrowth(amount, fund.avgAnnualReturn, m.year),
            }));
            const maxValue = values[values.length - 1].value;

            return (
              <div className="mt-6 bg-primary-light rounded-[var(--radius-md)] p-5">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <p className="text-sm font-semibold text-primary-dark">
                    How {formatCurrency(amount)} could grow
                  </p>
                </div>

                <div className="flex items-end gap-2 mb-2" style={{ height: 140 }}>
                  {values.map((m) => {
                    const barMaxHeight = 100;
                    const barHeight = Math.max(
                      Math.round((m.value / maxValue) * barMaxHeight),
                      6
                    );
                    const isLast = m.year === 30;
                    return (
                      <div
                        key={m.year}
                        className="flex-1 flex flex-col items-center justify-end"
                      >
                        <span
                          className={`text-[11px] font-bold mb-1 ${
                            isLast ? "text-primary-dark" : "text-primary-dark/70"
                          }`}
                        >
                          {formatCurrency(m.value)}
                        </span>
                        <div
                          className={`w-full rounded-t-md transition-all duration-500 ${
                            isLast ? "bg-primary" : "bg-primary/40"
                          }`}
                          style={{ height: barHeight }}
                        />
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-2">
                  {values.map((m) => (
                    <div key={m.year} className="flex-1 text-center">
                      <span className="text-[11px] text-primary-dark/60">
                        {m.label}
                      </span>
                    </div>
                  ))}
                </div>

                <p className="text-[11px] text-primary-dark/50 mt-3">
                  *Based on historical avg. return of{" "}
                  {(fund.avgAnnualReturn * 100).toFixed(1)}% per year. Past
                  performance does not guarantee future results.
                </p>
              </div>
            );
          })()}
        </div>

        {/* Giver info */}
        <div className="bg-surface rounded-[var(--radius-xl)] shadow-card p-6 mb-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4 font-[family-name:var(--font-body)]">
            Your details
          </h2>
          <div className="space-y-4">
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
                rows={3}
                placeholder="Happy birthday! Wishing you all the best..."
                className="w-full rounded-[var(--radius-md)] border border-border bg-surface px-4 py-2.5 text-base text-text-primary placeholder:text-text-secondary/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-[var(--radius-md)] p-4 mb-4">
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
          Gift {amount > 0 ? formatCurrency(amount) : ""} to {giftPage.childName}
        </Button>

        <p className="text-center text-xs text-text-secondary mt-4">
          Payments processed securely by Stripe. SeedGift never stores your
          payment information.
        </p>
      </main>
    </div>
  );
}
