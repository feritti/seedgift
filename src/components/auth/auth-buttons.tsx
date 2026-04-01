"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function AuthButtons() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback?next=/dashboard`,
      },
    });

    if (signInError) {
      setError(signInError.message);
      setIsLoading(false);
      return;
    }

    setEmailSent(true);
    setIsLoading(false);
    router.push("/login/verify");
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleMagicLink} className="space-y-3">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-text-secondary mb-1.5"
          >
            Email address
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-[var(--radius-md)] border-2 border-border px-4 py-3 text-base text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        <button
          type="submit"
          disabled={isLoading || !email.trim()}
          className="w-full flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-base font-semibold text-text-inverse hover:bg-primary-dark transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Mail className="h-5 w-5" />
          )}
          {isLoading ? "Sending link..." : "Continue with email"}
        </button>
      </form>

      {emailSent && (
        <p className="text-center text-sm text-primary font-medium">
          Check your email for the sign-in link
        </p>
      )}
    </div>
  );
}
