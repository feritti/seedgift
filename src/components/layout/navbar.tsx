"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

const navLinks = [
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Benefits", href: "/#benefits" },
  { label: "FAQ", href: "/#faq" },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault();
    setMobileMenuOpen(false);

    if (pathname === "/") {
      // Already on homepage — smooth scroll to anchor
      const id = href.replace("/#", "");
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    } else {
      // On another page — navigate to homepage with hash
      router.push(href);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-border-light">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Sprout className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold text-text-primary">
              SeedGift
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop auth buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Link href="/send-gift">
              <Button variant="secondary" size="sm">
                Send a Gift
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-surface-muted transition-colors cursor-pointer"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        <div
          className={cn(
            "lg:hidden overflow-hidden transition-[max-height] duration-300",
            mobileMenuOpen ? "max-h-64" : "max-h-0"
          )}
        >
          <div className="pb-4 pt-2 space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block px-3 py-2 text-base font-medium text-text-secondary hover:text-text-primary hover:bg-surface-muted rounded-lg transition-colors"
                onClick={(e) => handleNavClick(e, link.href)}
              >
                {link.label}
              </a>
            ))}
            <div className="pt-2 flex flex-col gap-2 px-3">
              <Link href="/send-gift">
                <Button size="sm" className="w-full">
                  Send a Gift
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="secondary" size="sm" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="ghost" size="sm" className="w-full">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
