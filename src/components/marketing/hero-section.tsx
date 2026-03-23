import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          {/* Tagline */}
          <p className="text-sm font-semibold text-primary tracking-wide uppercase mb-4">
            Gifts that grow
          </p>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-normal leading-tight text-text-primary mb-6">
            Plant a financial seed for a child you love
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
            Skip the plastic toys and forgotten gift cards. Give a gift that
            lasts — money that parents can save and invest for their child's
            future.
          </p>

          {/* CTA */}
          <Link href="/signup">
            <Button size="lg" className="text-lg px-10 py-4">
              Create a Gift Page
            </Button>
          </Link>

          {/* Subtext under CTA */}
          <p className="mt-4 text-sm text-text-secondary">
            Free to create. No account needed to give.
          </p>
        </div>

        {/* Decorative circles — GoFundMe-inspired floating images */}
        <div className="hidden lg:block absolute inset-0 pointer-events-none">
          {/* Top left */}
          <div className="absolute top-16 left-8 w-32 h-32 rounded-full bg-primary-light border-4 border-primary/20 flex items-center justify-center">
            <span className="text-3xl">🎂</span>
          </div>
          {/* Bottom left */}
          <div className="absolute bottom-20 left-24 w-24 h-24 rounded-full bg-secondary border-4 border-amber-200/40 flex items-center justify-center">
            <span className="text-2xl">🎓</span>
          </div>
          {/* Top right */}
          <div className="absolute top-24 right-16 w-28 h-28 rounded-full bg-primary-light border-4 border-primary/20 flex items-center justify-center">
            <span className="text-3xl">🎁</span>
          </div>
          {/* Bottom right */}
          <div className="absolute bottom-16 right-8 w-36 h-36 rounded-full bg-secondary border-4 border-amber-200/40 flex items-center justify-center">
            <span className="text-3xl">🌱</span>
          </div>
          {/* Mid left */}
          <div className="absolute top-1/2 -translate-y-1/2 left-4 w-20 h-20 rounded-full bg-surface-muted border-4 border-border-light flex items-center justify-center">
            <span className="text-xl">🎄</span>
          </div>
          {/* Mid right */}
          <div className="absolute top-1/2 -translate-y-1/2 right-4 w-20 h-20 rounded-full bg-surface-muted border-4 border-border-light flex items-center justify-center">
            <span className="text-xl">📈</span>
          </div>
        </div>
      </div>
    </section>
  );
}
