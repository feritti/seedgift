import Link from "next/link";
import { UserPlus, Gift, Heart, Sparkles } from "lucide-react";
import {
  formatCurrency,
  formatDate,
} from "@/shared/utils/growth-calculator";
import type { AdminActivityEvent } from "@/lib/actions/admin";

const iconByKind = {
  user_signup: UserPlus,
  gift_page_created: Gift,
  gift_completed: Heart,
  sent_gift_completed: Sparkles,
} as const;

const labelPrefixByKind: Record<AdminActivityEvent["kind"], string> = {
  user_signup: "New signup",
  gift_page_created: "New gift page",
  gift_completed: "Gift completed",
  sent_gift_completed: "Sent gift completed",
};

export function ActivityItem({ event }: { event: AdminActivityEvent }) {
  const Icon = iconByKind[event.kind];
  const amount =
    event.kind === "gift_completed" || event.kind === "sent_gift_completed"
      ? formatCurrency(event.amountCents / 100)
      : null;

  return (
    <Link
      href={event.href}
      className="flex items-center gap-3 py-2 border-b border-border-light last:border-0 hover:bg-surface-muted rounded-[var(--radius-md)] px-2 -mx-2 transition-colors"
    >
      <div className="w-9 h-9 rounded-full bg-primary-light flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-text-primary truncate">
          <span className="text-text-secondary">
            {labelPrefixByKind[event.kind]} ·{" "}
          </span>
          {event.label}
        </p>
        <p className="text-xs text-text-secondary">
          {formatDate(event.createdAt)}
        </p>
      </div>
      {amount && (
        <p className="text-sm font-semibold text-text-primary shrink-0">
          {amount}
        </p>
      )}
    </Link>
  );
}
