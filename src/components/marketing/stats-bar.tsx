import { Gift, Banknote, Heart } from "lucide-react";

const highlights = [
  {
    icon: Gift,
    value: "Any Amount",
    label: "From $5 to $500, every gift counts",
  },
  {
    icon: Banknote,
    value: "Straight to You",
    label: "Gifts deposit directly to your bank account",
  },
  {
    icon: Heart,
    value: "2 min",
    label: "To set up a gift page",
  },
];

export function StatsBar() {
  return (
    <section className="bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {highlights.map((item) => (
            <div key={item.label} className="flex flex-col items-center">
              <item.icon className="h-6 w-6 text-text-inverse/70 mb-2" />
              <p className="text-3xl sm:text-4xl font-bold text-text-inverse mb-1">
                {item.value}
              </p>
              <p className="text-sm text-text-inverse/80">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
