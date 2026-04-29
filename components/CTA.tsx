"use client";

import { motion } from "framer-motion";

import MagneticButton from "@/components/MagneticButton";

export default function CTA() {
  return (
    <section id="contact" className="relative overflow-hidden px-6 py-24 md:px-10 md:py-32">
      <div className="page-shell">
        <div className="relative overflow-hidden rounded-[2.8rem] border border-white/10 bg-page-soft px-8 py-16 md:px-14 md:py-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            className="absolute left-1/2 top-1/2 h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-copper/20"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,153,95,0.22),transparent_35%),linear-gradient(135deg,rgba(255,255,255,0.04),transparent_40%,rgba(255,255,255,0.02))]" />
          <div className="absolute -left-12 bottom-0 h-56 w-56 rounded-full bg-copper/10 blur-3xl" />
          <div className="absolute -right-10 top-0 h-72 w-72 rounded-full bg-[#6b3c20]/20 blur-3xl" />

          <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center">
            <p className="section-label !justify-center !text-center">Next Cup</p>
            <h2 className="text-balance text-[clamp(2.6rem,6vw,5rem)] font-semibold leading-[0.94] tracking-[-0.05em] text-cream">
              Ready for your next coffee?
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-sand/76">
              Experience Faste Coffee today and turn your everyday run into something
              richer, warmer, and more cinematic.
            </p>

            <div className="mt-10">
              <MagneticButton href="#top" className="bg-white/10">
                Order Now
              </MagneticButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
