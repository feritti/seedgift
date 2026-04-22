"use client";

import { useState, useTransition } from "react";
import { User } from "lucide-react";
import { startImpersonation } from "@/lib/actions/admin-impersonation";
import { Button } from "@/components/ui/button";

export function ImpersonateButton({
  targetUserId,
  targetEmail,
}: {
  targetUserId: string;
  targetEmail: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onClick = () => {
    if (pending) return;
    const confirmed = window.confirm(
      `Sign in as ${targetEmail}? Your admin session will be swapped. Use the "Exit impersonation" banner at the top of the page to come back.`
    );
    if (!confirmed) return;
    setError(null);
    startTransition(async () => {
      try {
        await startImpersonation(targetUserId);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Could not start impersonation."
        );
      }
    });
  };

  return (
    <div className="inline-flex flex-col gap-1 items-start">
      <Button
        variant="secondary"
        size="sm"
        isLoading={pending}
        onClick={onClick}
      >
        <User className="h-4 w-4 mr-1.5" />
        Sign in as this user
      </Button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
