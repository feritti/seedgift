import { Landmark } from "lucide-react";

export function InvestmentOptionsSection() {
  return (
    <section className="bg-surface-muted py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
            <Landmark className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-3xl sm:text-4xl text-text-primary mb-6">
            How Parents Use Their Gifts
          </h2>
          <p className="text-text-secondary text-lg leading-relaxed">
            Once gifts are received, parents decide how to put the money to
            work. Many deposit funds into a 529 education savings plan, a
            UTMA/UGMA custodial account, or a brokerage account. SeedGift
            doesn&apos;t manage or invest funds — we just make it easy for your
            village to contribute.
          </p>
        </div>
      </div>
    </section>
  );
}
