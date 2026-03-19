import { Sprout } from "lucide-react";
import Link from "next/link";
import { AuthButtons } from "@/components/auth/auth-buttons";

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-surface rounded-[var(--radius-xl)] shadow-card p-8">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <Sprout className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-text-primary">SeedGift</span>
          </div>

          {/* Heading */}
          <h1 className="text-2xl text-center text-text-primary mb-2">
            Welcome back
          </h1>
          <p className="text-center text-text-secondary mb-8">
            Sign in to manage your gift pages
          </p>

          {/* Social login buttons */}
          <AuthButtons />

          {/* Sign up link */}
          <p className="mt-6 text-center text-sm text-text-secondary">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-primary font-medium hover:text-primary-dark"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
