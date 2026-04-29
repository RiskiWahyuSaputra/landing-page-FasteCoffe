"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const testimonials = [
  {
    quote:
      "Faste Coffee feels like someone designed my morning for me. Quick service, beautiful cups, and the flavor always lands.",
    author: "Nadia Putri",
    role: "Creative Strategist"
  },
  {
    quote:
      "The espresso is clean, the cappuccino is balanced, and the whole brand experience feels premium without trying too hard.",
    author: "Raka Aditya",
    role: "Product Designer"
  },
  {
    quote:
      "It has the speed of a grab-and-go cafe, but the detail of a specialty bar. That combination is why I keep coming back.",
    author: "Maya Santoso",
    role: "Daily Customer"
  }
];

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % testimonials.length);
    }, 5000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  const active = testimonials[activeIndex];

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden px-6 py-24 md:px-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(212,153,95,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(84,49,30,0.35),transparent_34%)]" />

      <div className="page-shell relative grid gap-10 lg:grid-cols-[0.38fr_0.62fr] lg:items-end">
        <div className="max-w-sm">
          <p className="section-label">Testimonials</p>
          <h2 className="text-balance text-[clamp(2.3rem,5vw,4rem)] font-semibold leading-[0.96] tracking-[-0.05em] text-cream">
            What the ritual feels like when it lands exactly right.
          </h2>

          <div className="mt-12 flex gap-2">
            {testimonials.map((item, index) => (
              <button
                key={item.author}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === activeIndex ? "w-14 bg-copper" : "w-8 bg-white/12"
                }`}
                aria-label={`Show testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="glass-panel min-h-[420px] rounded-[2.5rem] border border-white/10 p-8 md:p-12 lg:p-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.author}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="flex h-full flex-col justify-between gap-12"
            >
              <p className="max-w-3xl text-[clamp(1.6rem,3vw,3rem)] font-medium leading-[1.2] tracking-[-0.04em] text-cream">
                "{active.quote}"
              </p>

              <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-6">
                <div>
                  <p className="text-xl font-semibold text-cream">{active.author}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.24em] text-sand/68">
                    {active.role}
                  </p>
                </div>

                <div className="text-xs uppercase tracking-[0.24em] text-sand/58">
                  {String(activeIndex + 1).padStart(2, "0")} /{" "}
                  {String(testimonials.length).padStart(2, "0")}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
