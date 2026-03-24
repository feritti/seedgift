export const metadata = { title: "Privacy Policy | SeedGift" };

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <h1 className="text-4xl font-bold text-text-primary mb-2">
        Privacy Policy
      </h1>
      <p className="text-text-secondary mb-10">Last updated: March 23, 2026</p>

      <div className="prose prose-neutral max-w-none space-y-8 text-text-secondary leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-3">
            1. Information We Collect
          </h2>
          <p>
            When you create an account, we collect your name, email address, and
            profile picture from Google. When you create a gift page, we store
            your child&rsquo;s first name, date of birth, and chosen investment
            fund. When someone sends a gift, we collect the giver&rsquo;s name,
            email, gift amount, and optional note.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-3">
            2. How We Use Your Information
          </h2>
          <p>
            We use your information to operate SeedGift &mdash; creating gift
            pages, processing payments through Stripe, sending transaction
            emails, and displaying your dashboard. We do not sell your personal
            information to third parties.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-3">
            3. Payment Processing
          </h2>
          <p>
            All payments are processed by Stripe. SeedGift does not store credit
            card numbers or bank account details. Stripe&rsquo;s privacy policy
            governs how they handle your payment information.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-3">
            4. Data Storage
          </h2>
          <p>
            Your data is stored securely using Supabase (hosted on AWS).
            We use industry-standard encryption for data in transit and at rest.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-3">
            5. Your Rights
          </h2>
          <p>
            You may request access to, correction of, or deletion of your
            personal data at any time by contacting us at{" "}
            <a
              href="mailto:support@seedgift.xyz"
              className="text-primary hover:underline"
            >
              support@seedgift.xyz
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-3">
            6. Contact
          </h2>
          <p>
            If you have questions about this policy, please reach out via our{" "}
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
