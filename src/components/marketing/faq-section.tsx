import { Accordion } from "@/components/ui/accordion";
import { FAQ_DATA } from "@/shared/constants/faq-data";

export function FaqSection() {
  return (
    <section id="faq" className="bg-background py-20 sm:py-28">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-primary tracking-wide uppercase mb-3">
            Questions?
          </p>
          <h2 className="text-3xl sm:text-4xl text-text-primary">
            Frequently Asked Questions
          </h2>
        </div>

        <Accordion items={FAQ_DATA} />
      </div>
    </section>
  );
}
