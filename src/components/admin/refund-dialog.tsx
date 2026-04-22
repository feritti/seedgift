"use client";

import { useState, useTransition } from "react";
import { ShieldAlert, ExternalLink } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/shared/utils/growth-calculator";
import {
  refundGift,
  refundSentGift,
} from "@/lib/actions/admin-mutations";

interface RefundContext {
  id: string;
  source: "gift" | "sent_gift";
  amountCents: number;
  giverName: string;
  giverEmail: string;
  recipientLabel: string;
  stripePaymentId: string | null;
  isDestinationCharge: boolean;
}

export function RefundButton({ context }: { context: RefundContext }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-red-600 hover:text-red-700 hover:underline cursor-pointer"
      >
        Refund
      </button>
      {open && (
        <RefundDialog
          context={context}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function RefundDialog({
  context,
  onClose,
}: {
  context: RefundContext;
  onClose: () => void;
}) {
  const [typed, setTyped] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const expected = formatCurrency(context.amountCents / 100);
  const matches = typed.trim() === expected;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matches || pending) return;
    setError(null);
    startTransition(async () => {
      try {
        if (context.source === "gift") {
          await refundGift(context.id, typed.trim());
        } else {
          await refundSentGift(context.id, typed.trim());
        }
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Refund failed.");
      }
    });
  };

  return (
    <Modal isOpen onClose={onClose} title="Refund this gift?">
      <div className="space-y-4">
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-[var(--radius-md)] p-3">
          <ShieldAlert className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-sm text-red-700">
            <p className="font-semibold">This will charge Stripe and cannot be undone.</p>
            {context.isDestinationCharge ? (
              <p className="mt-1">
                Funds will be pulled back from the parent&apos;s Stripe Connect
                account and returned to the giver&apos;s card.
              </p>
            ) : (
              <p className="mt-1">
                Funds will be returned from the SeedGift platform balance to the
                giver&apos;s card.
              </p>
            )}
          </div>
        </div>

        <dl className="text-sm grid grid-cols-[auto,1fr] gap-x-4 gap-y-2">
          <dt className="text-text-secondary">Amount</dt>
          <dd className="font-semibold text-text-primary">{expected}</dd>
          <dt className="text-text-secondary">Giver</dt>
          <dd className="text-text-primary">
            {context.giverName} · {context.giverEmail}
          </dd>
          <dt className="text-text-secondary">Recipient</dt>
          <dd className="text-text-primary">{context.recipientLabel}</dd>
          {context.stripePaymentId && (
            <>
              <dt className="text-text-secondary">Payment</dt>
              <dd>
                <a
                  href={`https://dashboard.stripe.com/payments/${context.stripePaymentId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-primary hover:underline inline-flex items-center gap-1 font-mono"
                >
                  {context.stripePaymentId}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </dd>
            </>
          )}
        </dl>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            id="refund-confirm"
            label={`Type "${expected}" to confirm`}
            placeholder={expected}
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            autoComplete="off"
            autoFocus
          />

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-[var(--radius-md)] p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              disabled={!matches || pending}
              isLoading={pending}
            >
              Refund {expected}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
