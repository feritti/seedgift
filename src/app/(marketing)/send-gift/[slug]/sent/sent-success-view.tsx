"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Copy, Mail, MessageSquare, Sprout, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  calculateGrowth,
  formatCurrency,
} from "@/shared/utils/growth-calculator";
import { getFundByTicker } from "@/shared/constants/funds";
import type { SentGift } from "@/shared/types/sent-gift";

const PROJECTION_YEARS = 18;

export function SentSuccessView({
  sentGift,
  shareUrl,
}: {
  sentGift: SentGift;
  shareUrl: string;
}) {
  const [copied, setCopied] = useState(false);
  const fund = getFundByTicker(sentGift.fundTicker);
  const amountDollars = sentGift.amountCents / 100;
  const projected = fund
    ? calculateGrowth(amountDollars, fund.avgAnnualReturn, PROJECTION_YEARS)
    : 0;

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
    `I sent ${sentGift.childName} a SeedGift — an investment for their future. View it here: ${shareUrl}`
  )}`;

  const smsHref = `sms:?&body=${encodeURIComponent(
    `A SeedGift for ${sentGift.childName}: ${shareUrl}`
  )}`;

  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary-light/50 to-background">
        <div className="max-w-xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary mb-5 shadow-sm">
            <Sprout className="h-8 w-8 text-text-inverse" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-3">
            Your gift is on its way!
          </h1>
          <p className="text-base text-text-secondary mb-1">
            We&apos;ve emailed{" "}
            <span className="font-semibold text-text-primary">
              {sentGift.recipientEmail}
            </span>{" "}
            about your {formatCurrency(amountDollars)} gift for{" "}
            {sentGift.childName}&apos;s {sentGift.occasion}.
          </p>
          <p className="text-sm text-text-secondary">
            A receipt is on its way to{" "}
            <span className="font-medium text-text-primary">
              {sentGift.giverEmail}
            </span>
            .
          </p>
        </div>
      </section>

      <main className="max-w-xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Share link */}
        <section className="bg-surface rounded-[var(--radius-xl)] shadow-card p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-1">
            Share the gift directly
          </h2>
          <p className="text-sm text-text-secondary mb-4">
            If you want to tell {sentGift.recipientName || sentGift.childName}&apos;s parent yourself, send them this link.
          </p>
          <div className="flex gap-2 mb-3">
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
                  Copy
                </>
              )}
            </Button>
          </div>
          <div className="flex gap-2">
            <a href={mailtoHref} className="flex-1">
              <Button variant="secondary" size="sm" className="w-full">
                <Mail className="h-4 w-4 mr-1.5" />
                Email
              </Button>
            </a>
            <a href={smsHref} className="flex-1">
              <Button variant="secondary" size="sm" className="w-full">
                <MessageSquare className="h-4 w-4 mr-1.5" />
                Text
              </Button>
            </a>
            <Link href={`/g/${sentGift.slug}`} className="flex-1">
              <Button variant="secondary" size="sm" className="w-full">
                <Eye className="h-4 w-4 mr-1.5" />
                Preview
              </Button>
            </Link>
          </div>
        </section>

        {/* Gift summary card */}
        <section className="bg-surface rounded-[var(--radius-xl)] shadow-card p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            What you sent
          </h2>
          <div className="space-y-2 text-sm">
            <Row label="For" value={`${sentGift.childName}'s ${sentGift.occasion}`} />
            <Row label="From" value={sentGift.giverName} />
            <Row label="Amount" value={formatCurrency(amountDollars)} />
            <Row
              label="Invested in"
              value={
                fund
                  ? `${fund.ticker} · ${fund.name}`
                  : `${sentGift.fundTicker} · ${sentGift.fundName}`
              }
            />
          </div>
          {fund && (
            <div className="mt-4 pt-4 border-t border-border-light">
              <p className="text-xs text-text-secondary mb-1">
                Projected value in {PROJECTION_YEARS} years
              </p>
              <p className="text-2xl font-bold text-primary-dark">
                {formatCurrency(projected)}
              </p>
              <p className="text-xs text-text-secondary mt-0.5">
                At {(fund.avgAnnualReturn * 100).toFixed(1)}% average annual return. Not guaranteed.
              </p>
            </div>
          )}
        </section>

        {/* What happens next */}
        <section className="bg-primary-light/40 rounded-[var(--radius-xl)] p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-3">
            What happens next?
          </h2>
          <ol className="space-y-3 text-sm text-text-primary">
            <li className="flex gap-3">
              <span className="flex-shrink-0 h-6 w-6 rounded-full bg-primary text-text-inverse font-semibold text-xs flex items-center justify-center">
                1
              </span>
              <span>
                {sentGift.recipientEmail} receives an email with the gift details.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 h-6 w-6 rounded-full bg-primary text-text-inverse font-semibold text-xs flex items-center justify-center">
                2
              </span>
              <span>
                They can claim the gift using this email, and choose (or keep) the
                investment you picked.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 h-6 w-6 rounded-full bg-primary text-text-inverse font-semibold text-xs flex items-center justify-center">
                3
              </span>
              <span>
                The funds are invested and left to grow — a real head start for{" "}
                {sentGift.childName}.
              </span>
            </li>
          </ol>
        </section>

        <div className="pt-2 pb-6 text-center">
          <Link href="/send-gift">
            <Button variant="ghost" size="sm">
              Send another gift
            </Button>
          </Link>
        </div>
      </main>
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
