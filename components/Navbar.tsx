"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

import { useCart } from "@/components/CartProvider";
import { useLocale } from "@/components/LocaleProvider";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { itemCount, toggleCart, isCartOpen } = useCart();
  const { locale, t, setLocale } = useLocale();

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
    document.documentElement.style.overflow =
      isOpen || isCartOpen ? "hidden" : "";

    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [isCartOpen, isOpen]);

  const links = [
    { label: t("home"), href: "#top" },
    { label: t("about"), href: "#about" },
    { label: t("menu"), href: "#menu" },
    { label: t("contact"), href: "#contact" },
  ];

  return (
    <>
      <motion.header
        initial={false}
        animate={{
          backgroundColor: isScrolled
            ? "rgba(30, 21, 16, 0.84)"
            : "rgba(30, 21, 16, 0.28)",
          borderColor: isScrolled
            ? "rgba(231, 214, 188, 0.15)"
            : "rgba(231, 214, 188, 0.08)",
        }}
        className="fixed inset-x-3 top-3 z-50 rounded-full border backdrop-blur-xl sm:inset-x-4 sm:top-4"
      >
        <div className="page-shell flex h-16 items-center justify-between gap-2 sm:h-20 sm:gap-4">
          <a
            href="#top"
            className="shrink-0 text-sm font-semibold uppercase tracking-[0.3em] text-cream sm:text-lg sm:tracking-[0.38em]"
          >
            Faste.
          </a>

          <div className="flex min-w-0 items-center justify-end gap-1.5 sm:gap-3">
            {/* Language Switcher */}
            <div className="theme-pill flex shrink-0 items-center gap-0.5 rounded-full border p-0.5 sm:gap-1 sm:p-1">
              <button
                type="button"
                onClick={() => setLocale("id")}
                className={`rounded-full px-2 py-1.5 text-[0.62rem] font-medium uppercase tracking-[0.16em] transition sm:px-2.5 sm:text-[0.65rem] sm:tracking-[0.2em] ${
                  locale === "id"
                    ? "bg-copper text-ink"
                    : "text-sand hover:bg-[rgba(243,234,216,0.07)] hover:text-cream"
                }`}
              >
                ID
              </button>
              <button
                type="button"
                onClick={() => setLocale("en")}
                className={`rounded-full px-2 py-1.5 text-[0.62rem] font-medium uppercase tracking-[0.16em] transition sm:px-2.5 sm:text-[0.65rem] sm:tracking-[0.2em] ${
                  locale === "en"
                    ? "bg-copper text-ink"
                    : "text-sand hover:bg-[rgba(243,234,216,0.07)] hover:text-cream"
                }`}
              >
                EN
              </button>
            </div>

            <button
              type="button"
              onClick={toggleCart}
              aria-label={t("open_cart")}
              className="group theme-pill inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-1.5 text-xs uppercase tracking-[0.2em] text-sand transition-colors duration-300 hover:border-copper/50 hover:text-cream sm:gap-2 sm:px-3 sm:py-2 sm:tracking-[0.24em]"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(243,234,216,0.06)] transition-colors duration-300 group-hover:bg-copper/14 sm:h-9 sm:w-9">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-4 w-4 text-sand/80 transition-colors duration-300 group-hover:text-copper sm:h-[18px] sm:w-[18px]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="9" cy="20" r="1.25" />
                  <circle cx="18" cy="20" r="1.25" />
                  <path d="M3 4h2.2l2.2 10.2a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.76L20 8H7.1" />
                </svg>
              </span>
              <span className="inline-flex min-w-7 items-center justify-center rounded-full bg-[rgba(243,234,216,0.08)] px-1.5 py-1 text-[0.64rem] text-cream sm:min-w-8 sm:px-2 sm:text-[0.68rem]">
                {String(itemCount).padStart(2, "0")}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setIsOpen((value) => !value)}
              className="group theme-pill inline-flex shrink-0 items-center gap-0 rounded-full border px-3 py-2 text-xs uppercase tracking-[0.2em] text-sand transition-colors duration-300 hover:border-copper/50 hover:text-cream sm:gap-3 sm:px-5 sm:tracking-[0.28em]"
            >
              <span className="relative flex h-3.5 w-5 flex-col justify-between sm:mr-0">
                <span className="block h-px w-full bg-current" />
                <span className="block h-px w-full bg-current" />
                <span className="block h-px w-full bg-current" />
              </span>
              <span className="hidden sm:inline">
                {isOpen ? t("close") : t("menu")}
              </span>
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
            className="fixed inset-0 z-[60] bg-[rgba(20,14,11,0.92)] backdrop-blur-2xl"
          >
            <div className="page-shell flex min-h-screen flex-col justify-between py-8">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold uppercase tracking-[0.38em] text-cream">
                  Faste.
                </span>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="theme-pill rounded-full border px-5 py-2 text-xs uppercase tracking-[0.28em] text-sand transition hover:border-copper/50 hover:text-cream"
                >
                  {t("close")}
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
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="block text-[clamp(2.6rem,10vw,7rem)] font-semibold leading-[0.9] tracking-[-0.05em] text-cream/90 transition hover:text-copper"
                    >
                      {link.label}
                    </motion.a>
                  ))}
                </nav>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{
                    delay: 0.24,
                    duration: 0.6,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="grid gap-10 text-sand/78 sm:grid-cols-2 lg:grid-cols-1"
                >
                  <div>
                    <p className="section-label">{t("social")}</p>
                    <div className="space-y-3 text-sm uppercase tracking-[0.2em]">
                      <a
                        href="https://instagram.com"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Instagram
                      </a>
                      <a
                        href="https://tiktok.com"
                        target="_blank"
                        rel="noreferrer"
                      >
                        TikTok
                      </a>
                      <a href="https://x.com" target="_blank" rel="noreferrer">
                        X
                      </a>
                    </div>
                  </div>

                  <div>
                    <p className="section-label">{t("contact")}</p>
                    <div className="space-y-3 text-sm leading-relaxed">
                      <p>hello@fastecoffee.com</p>
                      <p>+62 21 555 2400</p>
                      <p>{t("location_jakarta")}</p>
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
