"use client";

import { useState, useMemo } from "react";
import {
  Sprout,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  Gift,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  calculateGrowth,
  formatCurrency,
} from "@/shared/utils/growth-calculator";
import { FUNDS, getFundByTicker } from "@/shared/constants/funds";
import { OCCASIONS } from "@/shared/constants/occasions";
import { cn } from "@/lib/cn";

const PRESET_AMOUNTS = [25, 50, 100, 250];
const LONG_TERM_YEARS = 18;
const TOY_COMPARE_AMOUNT = 50;

export function SendGiftForm() {
  // Recipient
  const [childName, setChildName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [occasion, setOccasion] = useState("Birthday");

  // Investment
  const [fundTicker, setFundTicker] = useState("VOO");

  // Amount
  const [selectedAmount, setSelectedAmount] = useState<number | null>(50);
  const [customAmount, setCustomAmount] = useState("");
  const [isCustom, setIsCustom] = useState(false);

  // Giver info
  const [giverName, setGiverName] = useState("");
  const [giverEmail, setGiverEmail] = useState("");
  const [message, setMessage] = useState("");

  // UI state
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const amount = isCustom ? parseFloat(customAmount) || 0 : selectedAmount || 0;
  const fund = getFundByTicker(fundTicker);

  // Projected growth for the chosen fund/amount
  const projectedValue = useMemo(
    () =>
      fund && amount > 0
        ? calculateGrowth(amount, fund.avgAnnualReturn, LONG_TERM_YEARS)
        : 0,
    [fund, amount]
  );

  // Static comparison: $50 toy vs $50 invested at VOO for 18 years
  const toyCompareInvested = useMemo(() => {
    const voo = getFundByTicker("VOO");
    return voo
      ? calculateGrowth(TOY_COMPARE_AMOUNT, voo.avgAnnualReturn, LONG_TERM_YEARS)
      : 0;
  }, []);

  const handleSend = async () => {
    setErrorMessage(null);

    // Client-side validation (server re-validates)
    if (!childName.trim()) {
      setErrorMessage("Please enter the child's name.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
      setErrorMessage("Please enter a valid recipient (parent) email.");
      return;
    }
    if (!giverName.trim()) {
      setErrorMessage("Please enter your name.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(giverEmail)) {
      setErrorMessage("Please enter your email address.");
      return;
    }
    const amountCents = Math.round(amount * 100);
    if (amountCents < 100 || amountCents > 1_000_000) {
      setErrorMessage("Amount must be between $1 and $10,000.");
      return;
    }
    if (message.length > 500) {
      setErrorMessage("Message must be under 500 characters.");
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch("/api/send-gift/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          giverName: giverName.trim(),
          giverEmail: giverEmail.trim().toLowerCase(),
          recipientEmail: recipientEmail.trim().toLowerCase(),
          childName: childName.trim(),
          occasion,
          amountCents,
          fundTicker,
          message: message.trim() || null,
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

  const canSubmit =
    !!childName.trim() &&
    !!recipientEmail &&
    !!giverName.trim() &&
    !!giverEmail &&
    amount > 0 &&
    !isProcessing;

  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary-light/50 to-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-surface rounded-full px-4 py-1.5 shadow-sm border border-border-light mb-6">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-text-primary">
              No account needed to send
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-text-primary mb-4">
            Send a gift that grows
          </h1>
          <p className="text-lg text-text-secondary max-w-xl mx-auto mb-6">
            Skip the toys they&apos;ll forget. Send an investment that will still
            matter when they&apos;re old enough to understand it.
          </p>
          <div className="inline-flex items-baseline gap-2 text-text-secondary">
            <span className="text-base">${TOY_COMPARE_AMOUNT} toy today</span>
            <span className="text-border">→</span>
            <span className="text-base">{formatCurrency(0)}</span>
            <span className="text-border">·</span>
            <span className="text-base font-semibold text-primary-dark">
              ${TOY_COMPARE_AMOUNT} invested today
            </span>
            <span className="text-border">→</span>
            <span className="text-base font-bold text-primary-dark">
              {formatCurrency(toyCompareInvested)}
            </span>
            <span className="text-sm text-text-secondary/80">
              in {LONG_TERM_YEARS} years*
            </span>
          </div>
        </div>
      </section>

      {/* Form */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        {/* Section 1: Who is this for */}
        <section className="bg-surface rounded-[var(--radius-xl)] shadow-card p-6">
          <div className="flex items-start gap-3 mb-5">
            <StepBadge n={1} />
            <div>
              <h2 className="text-xl font-semibold text-text-primary">
                Who is this for?
              </h2>
              <p className="text-sm text-text-secondary">
                The parent&apos;s email is how they&apos;ll receive and claim the gift.
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <Input
              id="childName"
              label="Child's name"
              placeholder="e.g., Alice"
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              maxLength={100}
              required
            />
            <Input
              id="recipientEmail"
              label="Parent's email"
              type="email"
              placeholder="parent@example.com"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              helperText="We'll send them the gift and instructions to claim it."
              required
            />
            <Select
              id="occasion"
              label="Occasion"
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              options={OCCASIONS.map((o) => ({ value: o.value, label: o.label }))}
            />
          </div>
        </section>

        {/* Section 2: Pick an investment */}
        <section className="bg-surface rounded-[var(--radius-xl)] shadow-card p-6">
          <div className="flex items-start gap-3 mb-5">
            <StepBadge n={2} />
            <div>
              <h2 className="text-xl font-semibold text-text-primary">
                Pick an investment
              </h2>
              <p className="text-sm text-text-secondary">
                The parent can change this later if they prefer something else.
              </p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {FUNDS.map((f) => {
              const selected = f.ticker === fundTicker;
              return (
                <button
                  key={f.ticker}
                  type="button"
                  onClick={() => setFundTicker(f.ticker)}
                  className={cn(
                    "text-left rounded-[var(--radius-lg)] border p-4 transition-colors cursor-pointer",
                    selected
                      ? "border-primary bg-primary-light/40 ring-2 ring-primary/20"
                      : "border-border hover:border-primary/40 hover:bg-surface-muted"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-text-primary">
                      {f.ticker}
                    </span>
                    <span className="text-xs text-text-secondary">
                      ~{(f.avgAnnualReturn * 100).toFixed(1)}% avg / yr
                    </span>
                  </div>
                  <p className="text-sm font-medium text-text-primary mb-1">
                    {f.name}
                  </p>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {f.description}
                  </p>
                  {selected && (
                    <div className="flex items-center gap-1 mt-2 text-xs font-medium text-primary-dark">
                      <Check className="h-3.5 w-3.5" />
                      Selected
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Section 3: Amount */}
        <section className="bg-surface rounded-[var(--radius-xl)] shadow-card p-6">
          <div className="flex items-start gap-3 mb-5">
            <StepBadge n={3} />
            <div>
              <h2 className="text-xl font-semibold text-text-primary">
                How much?
              </h2>
              <p className="text-sm text-text-secondary">
                Even small amounts compound into something meaningful.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {PRESET_AMOUNTS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  setSelectedAmount(preset);
                  setIsCustom(false);
                  setCustomAmount("");
                }}
                className={cn(
                  "py-3 rounded-[var(--radius-md)] text-center font-semibold transition-colors cursor-pointer",
                  !isCustom && selectedAmount === preset
                    ? "bg-primary text-text-inverse"
                    : "bg-surface-muted text-text-primary hover:bg-primary-light"
                )}
              >
                ${preset}
              </button>
            ))}
          </div>
          <Input
            placeholder="Custom amount ($)"
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

          {amount > 0 && fund && (
            <div className="mt-4 bg-primary-light rounded-[var(--radius-md)] p-4">
              <div className="flex items-start gap-2">
                <TrendingUp className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-primary-dark">
                    {formatCurrency(amount)} in {fund.ticker} could grow to{" "}
                    <span className="font-bold">
                      {formatCurrency(projectedValue)}
                    </span>{" "}
                    in {LONG_TERM_YEARS} years*
                  </p>
                  <p className="text-xs text-primary-dark/70 mt-0.5">
                    *{(fund.avgAnnualReturn * 100).toFixed(1)}% avg. annual
                    return. Past performance does not guarantee future results.
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Section 4: Your details + message */}
        <section className="bg-surface rounded-[var(--radius-xl)] shadow-card p-6">
          <div className="flex items-start gap-3 mb-5">
            <StepBadge n={4} />
            <div>
              <h2 className="text-xl font-semibold text-text-primary">
                Make it personal
              </h2>
              <p className="text-sm text-text-secondary">
                We&apos;ll send your receipt to this email.
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <Input
              id="giverName"
              label="Your name"
              placeholder="e.g., Grandma Sue"
              value={giverName}
              onChange={(e) => setGiverName(e.target.value)}
              maxLength={100}
              required
            />
            <Input
              id="giverEmail"
              label="Your email"
              type="email"
              placeholder="you@example.com"
              value={giverEmail}
              onChange={(e) => setGiverEmail(e.target.value)}
              required
            />
            <div className="w-full">
              <label
                htmlFor="message"
                className="block text-sm font-medium text-text-primary mb-1.5"
              >
                A note (optional)
              </label>
              <textarea
                id="message"
                rows={3}
                placeholder={`Happy ${occasion.toLowerCase()}, ${
                  childName || "sweetheart"
                }! Wishing you a lifetime of growth...`}
                className="w-full rounded-[var(--radius-md)] border border-border bg-surface px-4 py-2.5 text-base text-text-primary placeholder:text-text-secondary/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={500}
              />
              <p className="mt-1.5 text-sm text-text-secondary">
                {message.length}/500 characters
              </p>
            </div>
          </div>
        </section>

        {/* Summary + submit */}
        {amount > 0 && fund && (
          <section className="bg-surface rounded-[var(--radius-xl)] shadow-card p-6">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">
              Review
            </h3>
            <div className="space-y-2 text-sm">
              <Row label="For" value={`${childName || "—"}'s ${occasion}`} />
              <Row label="Amount" value={formatCurrency(amount)} />
              <Row
                label="Invested in"
                value={`${fund.ticker} · ${fund.name}`}
              />
              <Row label="To" value={recipientEmail || "—"} />
            </div>
            <div className="flex justify-between items-baseline mt-4 pt-4 border-t border-border-light">
              <span className="text-base font-semibold text-text-primary">
                Total
              </span>
              <span className="text-xl font-bold text-text-primary">
                {formatCurrency(amount)}
              </span>
            </div>
          </section>
        )}

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-[var(--radius-md)] p-3">
            <p className="text-sm text-red-700">{errorMessage}</p>
          </div>
        )}

        <Button
          size="lg"
          className="w-full"
          disabled={!canSubmit}
          isLoading={isProcessing}
          onClick={handleSend}
        >
          <Gift className="h-5 w-5 mr-2" />
          {amount > 0 ? `Send ${formatCurrency(amount)}` : "Send the Gift"}
        </Button>

        <div className="flex items-center justify-center gap-4 text-xs text-text-secondary pb-4">
          <div className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span>Secured by Stripe</span>
          </div>
          <span className="text-border">|</span>
          <div className="flex items-center gap-1">
            <Sprout className="h-3.5 w-3.5 text-primary" />
            <span>No account needed</span>
          </div>
        </div>
      </main>
    </div>
  );
}

function StepBadge({ n }: { n: number }) {
  return (
    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary-light text-primary-dark font-bold text-sm shrink-0">
      {n}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-text-secondary">{label}</span>
      <span className="text-text-primary font-medium text-right">{value}</span>
    </div>
  );
}
