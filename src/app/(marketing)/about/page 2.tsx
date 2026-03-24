import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="bg-background py-16 sm:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-primary tracking-wide uppercase mb-3">
            Our Story
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl text-text-primary leading-tight">
            The gift that grows with your child
          </h1>
        </div>

        {/* Author photo */}
        <div className="flex justify-center mb-12">
          <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full overflow-hidden shadow-card">
            <Image
              src="/pete-ryan.jpg"
              alt="Pete Ryan, founder of SeedGift"
              width={192}
              height={192}
              className="w-full h-full object-cover"
              priority
            />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6 text-lg text-text-secondary leading-relaxed">
          <p>
            My name is Pete Ryan, and I have two beautiful kids — a
            three-year-old and a one-year-old. If parenthood has taught me one
            thing, it&apos;s this: children receive an almost comical number of
            toys at birthdays and holidays.
          </p>

          <p>
            Plastic dinosaurs, forgotten games, gadgets that break before the
            wrapping paper hits the floor. Most of it comes from China, most of
            it ends up in a landfill, and almost none of it is remembered a year
            later. I watched this cycle repeat itself at every birthday party,
            every Christmas morning — and I kept thinking: there has to be a
            better way to show a child you love them.
          </p>

          {/* Pull quote */}
          <blockquote className="border-l-4 border-primary pl-6 py-2 my-8">
            <p className="text-xl sm:text-2xl text-text-primary italic leading-snug">
              &ldquo;That $10,000 in gifts, invested wisely, could become
              several hundred thousand dollars by the time a child is ready to
              use it.&rdquo;
            </p>
          </blockquote>

          <p>
            We live in a deeply consumeristic culture, especially here in the
            United States. Walking into a birthday party with a wrapped gift is
            simply what you do — it&apos;s social currency, a reflex, a
            tradition handed down without much question. But what if we
            redirected that impulse? What if instead of another toy that&apos;ll
            be forgotten by February, family and friends could invest in a
            child&apos;s financial future — right from the gift table?
          </p>

          <p>
            The math is staggering when you let it sink in. Ten thousand dollars
            in gifts over a childhood, invested on a child&apos;s behalf and
            left to compound over 30 years, could grow into several hundred
            thousand dollars. Not a toy. Not plastic. A real, life-changing head
            start — the kind that funds a first home, pays off student debt, or
            seeds the next generation&apos;s own dreams. That&apos;s what
            Seedgift is built to make possible: turning the love people already
            want to give into the legacy a child will actually feel.
          </p>
        </div>

        {/* Signature */}
        <div className="mt-12 pt-8 border-t border-border-light">
          <p className="text-2xl text-text-primary italic font-[family-name:var(--font-heading)]">
            Pete Ryan
          </p>
          <p className="text-sm text-text-secondary mt-1">
            Founder, SeedGift
          </p>
        </div>
      </div>
    </div>
  );
}
