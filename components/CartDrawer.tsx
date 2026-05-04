"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

import MagneticButton from "@/components/MagneticButton";
import { useCart } from "@/components/CartProvider";
import { useLocale } from "@/components/LocaleProvider";
import { formatRupiah } from "@/lib/currency";

export default function CartDrawer() {
  const {
    items,
    subtotal,
    isCartOpen,
    closeCart,
    increaseItem,
    decreaseItem,
    removeItem
  } = useCart();
  const { t } = useLocale();

  return (
    <AnimatePresence>
      {isCartOpen ? (
        <>
          <motion.button
            type="button"
            aria-label="Close cart"
            onClick={closeCart}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm"
          />

          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-0 top-0 z-[80] flex h-screen w-full max-w-xl flex-col overflow-hidden border-l border-[rgba(231,214,188,0.12)] bg-[linear-gradient(180deg,#1d1510_0%,#120d0a_100%)] shadow-[0_0_60px_rgba(0,0,0,0.45)]"
          >
            <div className="flex items-center justify-between border-b border-[rgba(231,214,188,0.12)] px-6 py-5 md:px-8">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-sand/68">{t("cart")}</p>
                <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-cream">
                  {t("your_cart")}
                </h3>
              </div>

              <button
                type="button"
                onClick={closeCart}
                className="theme-pill rounded-full border px-4 py-2 text-xs uppercase tracking-[0.24em] text-sand transition hover:border-copper/50 hover:text-cream"
              >
                {t("close")}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 md:px-8">
              {items.length === 0 ? (
                <div className="glass-panel rounded-[2rem] border p-8 text-center">
                  <p className="text-lg font-medium text-cream">{t("empty_cart")}</p>
                  <p className="mt-3 text-sm leading-6 text-sand/72">
                    {t("add_items")}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.name}
                      className="glass-panel rounded-[1.8rem] border p-4"
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`h-24 w-20 shrink-0 rounded-[1.2rem] bg-gradient-to-br ${item.accent}`}
                        >
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="h-full w-full rounded-[1.2rem] object-cover"
                            />
                          ) : null}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h4 className="text-lg font-semibold text-cream">
                                {item.name}
                              </h4>
                              <p className="mt-1 text-sm leading-6 text-sand/70">
                                {item.description}
                              </p>
                            </div>
                            <span className="text-sm font-medium text-copper">
                              {item.price}
                            </span>
                          </div>

                          <div className="mt-4 flex items-center justify-between gap-4">
                            <div className="theme-pill flex items-center gap-2 rounded-full border p-1">
                              <button
                                type="button"
                                onClick={() => decreaseItem(item.name)}
                                className="h-8 w-8 rounded-full text-sm text-sand transition hover:bg-[rgba(243,234,216,0.08)] hover:text-cream"
                              >
                                -
                              </button>
                              <span className="min-w-8 text-center text-sm font-medium text-cream">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => increaseItem(item.name)}
                                className="h-8 w-8 rounded-full text-sm text-sand transition hover:bg-[rgba(243,234,216,0.08)] hover:text-cream"
                              >
                                +
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => removeItem(item.name)}
                              className="text-xs uppercase tracking-[0.24em] text-sand/68 transition hover:text-copper"
                            >
                              {t("remove")}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-[rgba(231,214,188,0.12)] px-6 py-6 md:px-8">
              <div className="mb-5 flex items-center justify-between text-sm uppercase tracking-[0.24em] text-sand/68">
                <span>{t("subtotal")}</span>
                <span className="text-lg font-semibold tracking-[-0.03em] text-cream">
                  {formatRupiah(subtotal)}
                </span>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <MagneticButton
                  href="#menu"
                  onClick={closeCart}
                  className="w-full justify-center"
                >
                  {t("back_to_menu")}
                </MagneticButton>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="w-full rounded-full border border-copper/40 bg-copper px-6 py-3 text-center text-sm font-medium uppercase tracking-[0.22em] text-ink transition hover:brightness-110"
                >
                  {t("checkout")}
                </Link>
              </div>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
