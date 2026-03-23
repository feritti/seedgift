const stats = [
  { value: "$2.4M+", label: "Gifted to children" },
  { value: "12,000+", label: "Gifts sent" },
  { value: "4,800+", label: "Families with gift pages" },
];

export function StatsBar() {
  return (
    <section className="bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl sm:text-4xl font-bold text-text-inverse mb-1">
                {stat.value}
              </p>
              <p className="text-sm text-text-inverse/80">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
