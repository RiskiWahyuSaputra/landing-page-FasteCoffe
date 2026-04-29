"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

import { useCart } from "@/components/CartProvider";

const links = [
  { label: "Home", href: "#top" },
  { label: "About", href: "#about" },
  { label: "Menu", href: "#menu" },
  { label: "Contact", href: "#contact" }
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { itemCount, toggleCart, isCartOpen } = useCart();

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = isOpen || isCartOpen ? "hidden" : "";

    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [isCartOpen, isOpen]);

  return (
    <>
      <motion.header
        initial={false}
        animate={{
          backgroundColor: isScrolled ? "rgba(16, 10, 7, 0.72)" : "rgba(16, 10, 7, 0)",
          borderColor: isScrolled ? "rgba(244, 234, 220, 0.12)" : "rgba(244, 234, 220, 0)"
        }}
        className="fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl"
      >
        <div className="page-shell flex h-20 items-center justify-between">
          <a
            href="#top"
            className="text-lg font-semibold uppercase tracking-[0.38em] text-cream"
          >
            Faste.
          </a>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleCart}
              className="group inline-flex items-center gap-3 rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.24em] text-sand transition-colors duration-300 hover:border-copper/50 hover:text-white"
            >
              <span className="text-sand/72 transition group-hover:text-copper">Cart</span>
              <span className="inline-flex min-w-8 items-center justify-center rounded-full bg-white/10 px-2 py-1 text-[0.68rem] text-cream">
                {String(itemCount).padStart(2, "0")}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setIsOpen((value) => !value)}
              className="group inline-flex items-center gap-3 rounded-full border border-white/10 px-5 py-2 text-xs uppercase tracking-[0.28em] text-sand transition-colors duration-300 hover:border-copper/50 hover:text-white"
            >
              <span className="relative flex h-3.5 w-5 flex-col justify-between">
                <span className="block h-px w-full bg-current" />
                <span className="block h-px w-full bg-current" />
                <span className="block h-px w-full bg-current" />
              </span>
              {isOpen ? "Close" : "Menu"}
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[60] bg-[rgba(11,7,5,0.94)] backdrop-blur-2xl"
          >
            <div className="page-shell flex min-h-screen flex-col justify-between py-8">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold uppercase tracking-[0.38em] text-cream">
                  Faste.
                </span>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full border border-white/10 px-5 py-2 text-xs uppercase tracking-[0.28em] text-sand transition hover:border-copper/50 hover:text-white"
                >
                  Close
                </button>
              </div>

              <div className="grid gap-12 py-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
                <nav className="space-y-4">
                  {links.map((link, index) => (
                    <motion.a
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 16 }}
                      transition={{
                        delay: 0.08 * index,
                        duration: 0.6,
                        ease: [0.22, 1, 0.36, 1]
                      }}
                      className="block text-[clamp(2.6rem,10vw,7rem)] font-semibold leading-[0.9] tracking-[-0.05em] text-cream/88 transition hover:text-white"
                    >
                      {link.label}
                    </motion.a>
                  ))}
                </nav>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ delay: 0.24, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="grid gap-10 text-sand/78 sm:grid-cols-2 lg:grid-cols-1"
                >
                  <div>
                    <p className="section-label">Social</p>
                    <div className="space-y-3 text-sm uppercase tracking-[0.2em]">
                      <a href="https://instagram.com" target="_blank" rel="noreferrer">
                        Instagram
                      </a>
                      <a href="https://tiktok.com" target="_blank" rel="noreferrer">
                        TikTok
                      </a>
                      <a href="https://x.com" target="_blank" rel="noreferrer">
                        X
                      </a>
                    </div>
                  </div>

                  <div>
                    <p className="section-label">Contact</p>
                    <div className="space-y-3 text-sm leading-relaxed">
                      <p>hello@fastecoffee.com</p>
                      <p>+62 21 555 2400</p>
                      <p>Jakarta - Brew Bar &amp; Daily Roastery</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
