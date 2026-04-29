"use client";

import { AnimatePresence, motion } from "framer-motion";

import MagneticButton from "@/components/MagneticButton";
import { useCart } from "@/components/CartProvider";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(value);
}

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
            className="fixed right-0 top-0 z-[80] flex h-screen w-full max-w-xl flex-col overflow-hidden border-l border-white/10 bg-[linear-gradient(180deg,#140c08_0%,#0d0806_100%)] shadow-[0_0_60px_rgba(0,0,0,0.45)]"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5 md:px-8">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-sand/68">Cart</p>
                <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-cream">
                  Your Coffee Order
                </h3>
              </div>

              <button
                type="button"
                onClick={closeCart}
                className="rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.24em] text-sand transition hover:border-copper/50 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 md:px-8">
              {items.length === 0 ? (
                <div className="glass-panel rounded-[2rem] border border-white/10 p-8 text-center">
                  <p className="text-lg font-medium text-cream">Cart is still empty.</p>
                  <p className="mt-3 text-sm leading-6 text-sand/72">
                    Add your favorite coffee from the menu and it will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.name}
                      className="glass-panel rounded-[1.8rem] border border-white/10 p-4"
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`h-24 w-20 shrink-0 rounded-[1.2rem] bg-gradient-to-br ${item.accent}`}
                        />

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
                            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] p-1">
                              <button
                                type="button"
                                onClick={() => decreaseItem(item.name)}
                                className="h-8 w-8 rounded-full text-sm text-sand transition hover:bg-white/10 hover:text-white"
                              >
                                -
                              </button>
                              <span className="min-w-8 text-center text-sm font-medium text-cream">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => increaseItem(item.name)}
                                className="h-8 w-8 rounded-full text-sm text-sand transition hover:bg-white/10 hover:text-white"
                              >
                                +
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => removeItem(item.name)}
                              className="text-xs uppercase tracking-[0.24em] text-sand/68 transition hover:text-white"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-white/10 px-6 py-6 md:px-8">
              <div className="mb-5 flex items-center justify-between text-sm uppercase tracking-[0.24em] text-sand/68">
                <span>Subtotal</span>
                <span className="text-lg font-semibold tracking-[-0.03em] text-cream">
                  {formatCurrency(subtotal)}
                </span>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <MagneticButton
                  href="#menu"
                  onClick={closeCart}
                  className="w-full justify-center"
                >
                  Continue Shopping
                </MagneticButton>
                <button
                  type="button"
                  className="w-full rounded-full border border-copper/40 bg-copper px-6 py-3 text-sm font-medium uppercase tracking-[0.22em] text-[#1a0f09] transition hover:bg-[#e2a86d]"
                >
                  Checkout
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
