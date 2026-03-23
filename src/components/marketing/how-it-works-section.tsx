import { UserPlus, Link2, TrendingUp } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Create a Gift Page",
    description:
      "Add your child's name, photo, and choose an investment fund. Pick the occasion — birthday, holiday, graduation — and you're set.",
  },
  {
    icon: Link2,
    title: "Share the Link",
    description:
      "Copy your unique gift page link and send it to grandparents, aunts, uncles, and friends. No account needed for them to give.",
  },
  {
    icon: TrendingUp,
    title: "Watch It Grow",
    description:
      "Collect gifts directly to your bank account via Stripe. Invest them in the fund you chose and watch compound interest work its magic.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-background py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-primary tracking-wide uppercase mb-3">
            Simple as 1-2-3
          </p>
          <h2 className="text-3xl sm:text-4xl text-text-primary">
            How It Works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16">
          {steps.map((step, index) => (
            <div key={step.title} className="text-center">
              {/* Step number + icon */}
              <div className="relative w-16 mx-auto mb-6">
                <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center">
                  <step.icon className="h-7 w-7 text-primary" />
                </div>
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary text-text-inverse text-sm font-bold flex items-center justify-center">
                  {index + 1}
                </span>
              </div>

              <h3 className="text-xl font-semibold text-text-primary mb-3 font-[family-name:var(--font-body)]">
                {step.title}
              </h3>
              <p className="text-text-secondary leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
