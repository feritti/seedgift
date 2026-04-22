"use client";

import { useState, useTransition } from "react";
import { Mail, Check } from "lucide-react";
import {
  resendGiftReceipt,
  resendGiftNotification,
  resendSentGiftReceipt,
  resendSentGiftNotification,
} from "@/lib/actions/admin-mutations";

type ResendKind =
  | "gift_receipt"
  | "gift_notification"
  | "sent_gift_receipt"
  | "sent_gift_notification";

export function ResendButton({
  kind,
  rowId,
  label,
}: {
  kind: ResendKind;
  rowId: string;
  /** Short label like "Resend receipt". */
  label: string;
}) {
  const [pending, startTransition] = useTransition();
  const [justSent, setJustSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = () => {
    if (pending) return;
    setError(null);
    startTransition(async () => {
      try {
        if (kind === "gift_receipt") await resendGiftReceipt(rowId);
        else if (kind === "gift_notification") await resendGiftNotification(rowId);
        else if (kind === "sent_gift_receipt") await resendSentGiftReceipt(rowId);
        else if (kind === "sent_gift_notification")
          await resendSentGiftNotification(rowId);
        setJustSent(true);
        setTimeout(() => setJustSent(false), 3000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Send failed.");
      }
    });
  };

  return (
    <div className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending || justSent}
        className="text-xs text-text-primary hover:text-primary hover:underline inline-flex items-center gap-1 cursor-pointer disabled:opacity-60 disabled:cursor-wait"
      >
        {justSent ? (
          <>
            <Check className="h-3 w-3 text-primary" />
            Sent
          </>
        ) : (
          <>
            <Mail className="h-3 w-3" />
            {label}
          </>
        )}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
