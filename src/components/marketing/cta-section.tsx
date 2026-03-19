import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="bg-primary py-20 sm:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl text-text-inverse mb-4">
          Ready to give a gift that grows?
        </h2>
        <p className="text-lg text-text-inverse/80 mb-8 max-w-xl mx-auto">
          Create your first gift page in minutes. It&apos;s free to set up and
          takes less than 2 minutes.
        </p>
        <Link href="/signup">
          <Button
            variant="secondary"
            size="lg"
            className="bg-white text-primary hover:bg-white/90 border-0 text-lg px-10 py-4"
          >
            Get Started Free
          </Button>
        </Link>
      </div>
    </section>
  );
}
