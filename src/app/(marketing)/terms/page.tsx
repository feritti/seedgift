export const metadata = { title: "Terms of Service | SeedGift" };

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <h1 className="text-4xl font-bold text-text-primary mb-2">
        Terms of Service
      </h1>
      <p className="text-text-secondary mb-10">Last updated: March 23, 2026</p>

      <div className="prose prose-neutral max-w-none space-y-8 text-text-secondary leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-3">
            1. Overview
          </h2>
          <p>
            SeedGift is a platform that allows parents to create gift pages for
            their children so family and friends can contribute financial gifts.
            By using SeedGift, you agree to these terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-3">
            2. Accounts
          </h2>
          <p>
            You must be at least 18 years old to create an account. You are
            responsible for maintaining the security of your account. One person
            may not maintain more than one account.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-3">
            3. Payments &amp; Fees
          </h2>
          <p>
            SeedGift does not currently charge a platform fee. Standard payment
            processing fees apply (charged by Stripe). All payments are
            processed in US dollars. Gift recipients receive funds directly to
            their connected Stripe account.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-3">
            4. Investment Information
          </h2>
          <p>
            SeedGift displays investment fund options and projected growth
            calculations for informational purposes only. SeedGift is not a
            financial advisor and does not provide investment advice. Projected
            returns are based on historical averages and are not guaranteed. Past
            performance does not guarantee future results.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-3">
            5. User Conduct
          </h2>
          <p>
            You agree not to use SeedGift for any unlawful purpose, to
            impersonate others, or to submit false information. We reserve the
            right to suspend or terminate accounts that violate these terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-3">
            6. Limitation of Liability
          </h2>
          <p>
            SeedGift is provided &ldquo;as is&rdquo; without warranty. We are
            not liable for any damages arising from your use of the platform,
            including but not limited to investment losses, payment processing
            errors, or service interruptions.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-3">
            7. Changes to Terms
          </h2>
          <p>
            We may update these terms from time to time. Continued use of
            SeedGift after changes constitutes acceptance of the new terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-3">
            8. Contact
          </h2>
          <p>
            Questions about these terms? Reach out via our{" "}
            <a href="/contact" className="text-primary hover:underline">
              contact page
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
