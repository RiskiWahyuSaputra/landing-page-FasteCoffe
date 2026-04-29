import TextReveal from "@/components/TextReveal";

export default function About() {
  return (
    <section id="about" className="relative overflow-hidden px-6 py-28 md:px-10 md:py-40">
      <div className="page-shell grid gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="max-w-md">
          <p className="section-label">About Faste</p>
          <h2 className="text-balance text-[clamp(2.6rem,6vw,5rem)] font-semibold leading-[0.92] tracking-[-0.05em] text-cream">
            Premium coffee for people who move with intention.
          </h2>
          <p className="mt-6 max-w-sm text-base leading-7 text-sand/72">
            Faste Coffee pairs a contemporary coffee ritual with the warmth of a craft
            roastery, creating a brand that feels elevated, efficient, and deeply human.
          </p>
        </div>

        <div className="glass-panel grain-overlay rounded-[2.4rem] border border-white/10 p-8 md:p-12">
          <TextReveal
            text="Faste Coffee is a modern coffee brand dedicated to delivering premium quality coffee with speed and consistency. From carefully selected beans to perfectly brewed cups, we redefine your coffee experience."
            className="text-balance text-[clamp(1.5rem,3vw,2.7rem)] font-medium leading-[1.24] tracking-[-0.03em] text-cream"
          />

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {[
              "Selected-origin beans",
              "Roasted for daily freshness",
              "Built for the modern commute"
            ].map((item) => (
              <div
                key={item}
                className="rounded-[1.4rem] border border-white/10 bg-white/[0.025] px-5 py-6 text-sm uppercase tracking-[0.22em] text-sand/78"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
