import { Sprout, Mail } from "lucide-react";
import Link from "next/link";

export default function VerifyRequestPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-surface rounded-[var(--radius-xl)] shadow-card p-8 text-center">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <Sprout className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-text-primary">
              SeedGift
            </span>
          </div>

          {/* Icon */}
          <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center mx-auto mb-6">
            <Mail className="h-8 w-8 text-primary" />
          </div>

          {/* Heading */}
          <h1 className="text-2xl text-text-primary mb-2">Check your email</h1>
          <p className="text-text-secondary mb-6">
            We sent you a sign-in link. Click the link in the email to access
            your account.
          </p>

          {/* Tips */}
          <div className="bg-surface-muted rounded-[var(--radius-md)] p-4 text-sm text-text-secondary text-left space-y-2">
            <p>
              📫 The email comes from{" "}
              <strong className="text-text-primary">noreply@seedgift.xyz</strong>
            </p>
            <p>📁 Check your spam folder if you don&apos;t see it</p>
            <p>⏰ The link expires in 10 minutes</p>
          </div>

          {/* Back link */}
          <p className="mt-6 text-sm text-text-secondary">
            <Link
              href="/login"
              className="text-primary font-medium hover:text-primary-dark"
            >
              ← Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
