import { HeroSection } from "@/components/marketing/hero-section";
import { StatsBar } from "@/components/marketing/stats-bar";
import { HowItWorksSection } from "@/components/marketing/how-it-works-section";
import { BenefitsSection } from "@/components/marketing/benefits-section";
import { InvestmentOptionsSection } from "@/components/marketing/investment-options-section";
import { FaqSection } from "@/components/marketing/faq-section";
import { CtaSection } from "@/components/marketing/cta-section";

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <StatsBar />
      <HowItWorksSection />
      <BenefitsSection />
      <InvestmentOptionsSection />
      <FaqSection />
      <CtaSection />
    </>
  );
}
