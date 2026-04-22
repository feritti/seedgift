import { cn } from "@/lib/cn";

type Tone = "success" | "warning" | "danger" | "muted";

const toneStyles: Record<Tone, string> = {
  success: "bg-primary-light text-primary-dark",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-red-100 text-red-700",
  muted: "bg-surface-muted text-text-secondary",
};

function toneFor(status: string): Tone {
  const s = status.toLowerCase();
  if (s === "completed" || s === "active" || s === "succeeded") return "success";
  if (s === "pending") return "warning";
  if (s === "failed") return "danger";
  if (s === "refunded" || s === "archived" || s === "paused") return "muted";
  return "muted";
}

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        toneStyles[toneFor(status)],
        className
      )}
    >
      {status}
    </span>
  );
}
