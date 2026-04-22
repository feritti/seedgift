"use client";

import { useTransition } from "react";
import { Pause, Play } from "lucide-react";
import { togglePauseGiftPage } from "@/lib/actions/admin-mutations";

export function PauseToggle({
  pageId,
  status,
}: {
  pageId: string;
  status: "active" | "paused" | string;
}) {
  const [pending, startTransition] = useTransition();
  if (status !== "active" && status !== "paused") return null;
  const isActive = status === "active";

  const label = isActive ? "Pause" : "Unpause";
  const Icon = isActive ? Pause : Play;
  const promptText = isActive
    ? "Pause this gift page? It won't accept new gifts until you unpause it."
    : "Unpause this gift page? It will start accepting gifts again.";

  const handleClick = () => {
    if (pending) return;
    if (!window.confirm(promptText)) return;
    startTransition(async () => {
      try {
        await togglePauseGiftPage(pageId);
      } catch (err) {
        window.alert(
          err instanceof Error ? err.message : "Failed to change page status."
        );
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="text-xs text-text-primary hover:text-primary hover:underline inline-flex items-center gap-1 cursor-pointer disabled:opacity-60 disabled:cursor-wait"
    >
      <Icon className="h-3 w-3" />
      {label}
    </button>
  );
}
