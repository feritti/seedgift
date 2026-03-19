import { Sparkles, Shield, Clock, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const benefits = [
  {
    icon: Sparkles,
    title: "Compound Growth",
    description:
      "A $50 gift invested at birth could grow to over $900 by age 18. Time is the most powerful ingredient in investing.",
    variant: "featured" as const,
  },
  {
    icon: Heart,
    title: "Meaningful Gifting",
    description:
      "Give something that matters. Instead of toys that get forgotten, give a financial foundation that lasts a lifetime.",
    variant: "default" as const,
  },
  {
    icon: Shield,
    title: "Safe & Secure",
    description:
      "All payments processed through Stripe. Funds go directly to the parent's bank account. No credit card data stored.",
    variant: "default" as const,
  },
  {
    icon: Clock,
    title: "Zero Friction",
    description:
      "Gift-givers don't need an account. Just pick an amount, add a note, and pay. Takes less than a minute.",
    variant: "featured" as const,
  },
];

export function BenefitsSection() {
  return (
    <section id="benefits" className="bg-surface-muted py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-primary tracking-wide uppercase mb-3">
            Why SeedGift
          </p>
          <h2 className="text-3xl sm:text-4xl text-text-primary">
            Gifts That Actually Matter
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {benefits.map((benefit) => (
            <Card key={benefit.title} variant={benefit.variant}>
              <CardContent>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <benefit.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2 font-[family-name:var(--font-body)]">
                  {benefit.title}
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  {benefit.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
