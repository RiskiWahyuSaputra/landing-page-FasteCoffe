"use client";

import Link from "next/link";
import { motion, useSpring } from "framer-motion";
import { useRef } from "react";

type MagneticButtonProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

export default function MagneticButton({
  href,
  children,
  className = ""
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const x = useSpring(0, { stiffness: 220, damping: 18, mass: 0.4 });
  const y = useSpring(0, { stiffness: 220, damping: 18, mass: 0.4 });

  const handleMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const bounds = element.getBoundingClientRect();
    const centerX = bounds.left + bounds.width / 2;
    const centerY = bounds.top + bounds.height / 2;

    x.set((event.clientX - centerX) * 0.18);
    y.set((event.clientY - centerY) * 0.18);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      style={{ x, y }}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      className="inline-flex"
    >
      <Link
        href={href}
        className={`group relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-white/10 bg-[rgba(244,234,220,0.08)] px-6 py-3 text-sm font-medium uppercase tracking-[0.24em] text-cream transition-colors duration-300 hover:border-copper/60 hover:text-white ${className}`}
      >
        <span className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,153,95,0.35),transparent_60%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <span className="relative">{children}</span>
        <span className="relative text-base transition-transform duration-300 group-hover:translate-x-1">
          -&gt;
        </span>
      </Link>
    </motion.div>
  );
}
