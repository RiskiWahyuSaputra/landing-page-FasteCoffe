"use client";

import { useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";

const stats = [
  { value: 10, suffix: "K+", labelKey: "cups_served" },
  { value: 5, suffix: "+", labelKey: "signature_drinks" },
  { value: 100, suffix: "%", labelKey: "premium_beans" },
  { value: 50, suffix: "+", labelKey: "daily_customers" }
];

function CountCard({
  value,
  suffix,
  label
}: {
  value: number;
  suffix: string;
  label: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isInView) {
      return;
    }

    let frame = 0;
    const duration = 1200;
    const start = performance.now();

    const animate = (time: number) => {
      const progress = Math.min((time - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(value * eased));

      if (progress < 1) {
        frame = window.requestAnimationFrame(animate);
      }
    };

    frame = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [isInView, value]);

  return (
    <div
      ref={ref}
      className="glass-panel rounded-[2rem] border p-8 text-center"
    >
      <div className="text-[clamp(2.5rem,6vw,4.8rem)] font-semibold leading-none tracking-[-0.06em] text-copper">
        {displayValue}
        {suffix}
      </div>
      <p className="mt-4 text-xs uppercase tracking-[0.28em] text-sand/72">{label}</p>
    </div>
  );
}

export default function Stats() {
  const { t } = useLocale();

  return (
    <section className="px-6 py-24 md:px-10 md:py-32">
      <div className="page-shell">
        <div className="mb-10 max-w-2xl">
          <p className="section-label">{t("daily_proof")}</p>

          <h2 className="text-balance text-[clamp(2.3rem,5vw,4rem)] font-semibold leading-[0.96] tracking-[-0.05em] text-cream">
            {t("stats_heading")}
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <CountCard
              key={stat.labelKey}
              value={stat.value}
              suffix={stat.suffix}
              label={t(stat.labelKey)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
