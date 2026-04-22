import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/cn";

type Accent = "default" | "amber" | "red";

const accentStyles: Record<Accent, string> = {
  default: "bg-primary/10 text-primary",
  amber: "bg-amber-100 text-amber-700",
  red: "bg-red-100 text-red-700",
};

export function AdminStatCard({
  title,
  value,
  description,
  icon: Icon,
  accent = "default",
}: {
  title: string;
  value: string;
  description?: string;
  icon: LucideIcon;
  accent?: Accent;
}) {
  return (
    <Card>
      <CardContent>
        <div className="flex items-center gap-3 mb-3">
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              accentStyles[accent]
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium text-text-secondary">{title}</p>
        </div>
        <p className="text-2xl font-bold text-text-primary">{value}</p>
        {description && (
          <p className="text-xs text-text-secondary mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
