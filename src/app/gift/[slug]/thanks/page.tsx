import { getStripe } from "@/lib/stripe";
import { getGiftPageBySlug } from "@/lib/actions/gift-pages";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  Sprout,
  CheckCircle,
  TrendingUp,
  Heart,
  ArrowRight,
} from "lucide-react";
import { formatCurrency } from "@/shared/utils/growth-calculator";

export default async function ThanksPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { slug } = await params;
  const { session_id } = await searchParams;

  if (!session_id) {
    redirect(`/gift/${slug}`);
  }

  // Verify the session server-side — never trust URL params alone
  let giverName = "Friend";
  let amountCents = 0;
  let childName = "";
  let eventName = "";
  let fundTicker = "";

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["line_items"],
    });

    if (session.payment_status !== "paid") {
      redirect(`/gift/${slug}`);
    }

    giverName = session.metadata?.giver_name ?? "Friend";
    const lineItem = session.line_items?.data?.[0];
    amountCents = lineItem?.amount_total ?? session.amount_subtotal ?? 0;

    // Parse child name + event from the product name: "Gift for Emma's Birthday"
    const productName = lineItem?.description ?? "";
    const match = productName.match(/^Gift for (.+?)'s (.+)$/);
    if (match) {
      childName = match[1];
      eventName = match[2];
    }
  } catch {
    // If Stripe lookup fails, fall back to gift page data
  }

  // Fill in any missing info from the gift page record
  if (!childName || !eventName) {
    const giftPage = await getGiftPageBySlug(slug);
    if (!giftPage) notFound();
    childName = giftPage.child_name;
    eventName = giftPage.event_name;
    fundTicker = fundTicker || giftPage.fund_ticker;
  } else {
    // Still need fund ticker if not parsed
    if (!fundTicker) {
      const giftPage = await getGiftPageBySlug(slug);
      fundTicker = giftPage?.fund_ticker ?? "";
    }
  }

  const firstName = giverName.split(" ")[0];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Minimal header */}
      <header className="bg-surface border-b border-border-light">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Sprout className="h-5 w-5 text-primary" />
            <span className="text-base font-bold text-text-primary">SeedGift</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-xl mx-auto w-full px-4 py-12 flex flex-col items-center text-center">
        {/* Success icon */}
        <div className="h-20 w-20 rounded-full bg-primary-light flex items-center justify-center mb-6">
          <CheckCircle className="h-10 w-10 text-primary" strokeWidth={1.5} />
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-4xl text-text-primary leading-tight mb-3">
          Your gift is on its way, {firstName}!
        </h1>
        <p className="text-base text-text-secondary max-w-sm mx-auto leading-relaxed">
          Thank you for planting a financial seed for {childName}. Your{" "}
          {amountCents > 0 ? (
            <span className="font-semibold text-text-primary">
              {formatCurrency(amountCents / 100)}
            </span>
          ) : (
            "gift"
          )}{" "}
          will be invested and grow over time — a gift that keeps giving.
        </p>

        {/* What happens next card */}
        <div className="mt-8 w-full bg-surface rounded-[var(--radius-xl)] shadow-card p-6 text-left space-y-4">
          <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <Heart className="h-4 w-4 text-primary" />
            What happens next
          </h2>
          <ol className="space-y-3">
            {[
              {
                title: "Receipt on the way",
                desc: "A confirmation email is headed to your inbox.",
              },
              {
                title: `Invested in ${fundTicker || "the market"}`,
                desc: `${childName}'s family will receive your gift and invest it on ${childName}'s behalf.`,
              },
              {
                title: "It grows with time",
                desc: `Your ${amountCents > 0 ? formatCurrency(amountCents / 100) : "gift"} has the potential to grow significantly by the time ${childName} needs it most.`,
              },
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary text-text-inverse text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">{item.title}</p>
                  <p className="text-xs text-text-secondary mt-0.5">{item.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Investment highlight */}
        {fundTicker && (
          <div className="mt-4 w-full flex items-center gap-3 bg-primary-light rounded-[var(--radius-xl)] p-4">
            <div className="h-10 w-10 rounded-[var(--radius-md)] bg-primary flex items-center justify-center shrink-0">
              <TrendingUp className="h-5 w-5 text-text-inverse" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-text-primary">
                Invested in {fundTicker}
              </p>
              <p className="text-xs text-text-secondary">
                A diversified, long-term investment for {childName}&apos;s future
              </p>
            </div>
          </div>
        )}

        {/* Back to gift page */}
        <div className="mt-8 flex flex-col items-center gap-3">
          <Link
            href={`/gift/${slug}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
          >
            View {childName}&apos;s gift page
            <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="text-xs text-text-secondary">
            See all the gifts {childName} has received so far
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-text-secondary border-t border-border-light">
        <p>
          &copy; {new Date().getFullYear()} SeedGift &middot;{" "}
          <Link href="/privacy" className="hover:underline">Privacy</Link>
          {" "}&middot;{" "}
          <Link href="/terms" className="hover:underline">Terms</Link>
        </p>
      </footer>
    </div>
  );
}
