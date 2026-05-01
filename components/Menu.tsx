"use client";

import { motion } from "framer-motion";

import { type CartMenuItem, useCart } from "@/components/CartProvider";

const menuItems: CartMenuItem[] = [
  {
    name: "Faste Signature",
    description: "Strong and bold classic shot",
    price: "Rp. 13.000",
    accent: "from-[#6a3c20] via-[#2f190f] to-[#140b08]",
  },
  {
    name: "Saka",
    description: "Perfect balance of coffee and milk foam",
    price: "Rp. 18.000",
    accent: "from-[#c58b56] via-[#5f341f] to-[#160c08]",
  },
  {
    name: "Latte",
    description: "Smooth and creamy coffee",
    price: "Rp. 18.000",
    accent: "from-[#dbc0a1] via-[#7b5638] to-[#120a07]",
  },
  {
    name: "Americano",
    description: "Light and rich flavor",
    price: "Rp. 15.000",
    accent: "from-[#8f5834] via-[#2a1810] to-[#120a07]",
  },
  {
    name: "Caramel Macchiato",
    description: "Sweet, creamy, and indulgent",
    price: "Rp. 20.000",
    accent: "from-[#efbc7e] via-[#87502b] to-[#170d08]",
  },
];

const brandCards = [
  {
    title: "Coffee Beans",
    description:
      "Dense crema, round body, and beans sourced for layered sweetness.",
    size: "lg:col-span-2",
  },
  {
    title: "Brewing Process",
    description:
      "Measured extraction, calibrated heat, and rhythm you can taste.",
    size: "",
  },
  {
    title: "Coffee Shop Vibe",
    description:
      "Warm light, tactile materials, and a pace made for everyday rituals.",
    size: "",
  },
  {
    title: "Barista Craft",
    description:
      "Fast hands, clean technique, and a finish that still feels personal.",
    size: "lg:col-span-2",
  },
];

export default function Menu() {
  const { addItem, decreaseItem, increaseItem, items } = useCart();
  const quantitiesByName = items.reduce<Record<string, number>>(
    (accumulator, item) => {
      accumulator[item.name] = item.quantity;
      return accumulator;
    },
    {},
  );

  return (
    <section
      id="menu"
      className="relative overflow-hidden px-6 py-28 md:px-10 md:py-40"
    >
      <div className="page-shell">
        <div className="mb-14 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="section-label">Popular Menu</p>
            <h2 className="text-balance text-[clamp(2.5rem,6vw,5.2rem)] font-semibold leading-[0.94] tracking-[-0.05em] text-cream">
              Signature drinks designed to feel familiar, elevated, and worth
              the pause.
            </h2>
          </div>

          <p className="max-w-md text-base leading-7 text-sand/72">
            A premium menu presented like a design object: warm, tactile, and
            built to invite exploration.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {menuItems.map((item, index) => (
            (() => {
              const quantity = quantitiesByName[item.name] ?? 0;

              return (
                <motion.article
                  key={item.name}
                  whileHover={{ y: -10, scale: 1.01 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="group glass-panel grain-overlay relative overflow-hidden rounded-[2rem] border border-white/10 p-5 shadow-halo"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,153,95,0.18),transparent_55%)] opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />

                  <div
                    className={`relative aspect-[4/3] overflow-hidden rounded-[1.6rem] bg-gradient-to-br ${item.accent}`}
                  >
                    <div className="absolute inset-x-8 bottom-6 top-8 rounded-[40%] border border-white/12 bg-white/[0.04] blur-[1px]" />
                    <div className="absolute left-1/2 top-[18%] h-28 w-28 -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute inset-x-12 bottom-10 h-12 rounded-full border border-white/15 bg-black/20 blur-sm" />
                    <div className="absolute left-1/2 top-10 h-28 w-28 -translate-x-1/2 rounded-full border border-white/15 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.22),rgba(255,255,255,0.05)_40%,transparent_70%)]" />
                    <div className="absolute inset-x-[30%] bottom-12 top-[33%] rounded-b-[2.4rem] rounded-t-[1rem] border border-white/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0.04))]" />
                    <div className="absolute bottom-4 left-4 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[0.68rem] uppercase tracking-[0.26em] text-sand/80">
                      Drink {index + 1}
                    </div>
                    {quantity ? (
                      <div className="absolute right-4 top-4 rounded-full border border-copper/30 bg-[rgba(212,153,95,0.16)] px-3 py-1 text-[0.68rem] uppercase tracking-[0.24em] text-copper">
                        In Cart x{quantity}
                      </div>
                    ) : null}
                  </div>

                  <div className="relative mt-5 flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-semibold tracking-[-0.03em] text-cream">
                        {item.name}
                      </h3>
                      <p className="mt-2 max-w-xs text-sm leading-6 text-sand/72">
                        {item.description}
                      </p>
                    </div>
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-copper">
                      {item.price}
                    </span>
                  </div>

                  <div className="relative mt-6 flex items-center justify-between gap-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-sand/64">
                      Freshly prepared signature drink
                    </p>

                    <div className="flex items-center gap-2 rounded-full border border-copper/30 bg-[rgba(212,153,95,0.12)] p-1">
                      <button
                        type="button"
                        onClick={() => decreaseItem(item.name)}
                        disabled={!quantity}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-lg text-copper transition hover:bg-copper hover:text-[#1a0f09] disabled:cursor-not-allowed disabled:opacity-35"
                        aria-label={`Kurangi ${item.name}`}
                      >
                        -
                      </button>
                      <span className="min-w-8 text-center text-sm font-medium text-cream">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          quantity ? increaseItem(item.name) : addItem(item)
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-full text-lg text-copper transition hover:bg-copper hover:text-[#1a0f09]"
                        aria-label={`Tambah ${item.name}`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </motion.article>
              );
            })()
          ))}
        </div>

        <div className="mt-28">
          <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="section-label">Brand Layers</p>
              <h3 className="text-balance text-[clamp(2rem,5vw,4rem)] font-semibold leading-[0.96] tracking-[-0.05em] text-cream">
                Lifestyle cues that turn a cup into a culture.
              </h3>
            </div>

            <p className="max-w-md text-sm leading-6 text-sand/70">
              Four editorial cards carrying the visual world around the product.
            </p>
          </div>

          <div className="grid auto-rows-[minmax(240px,1fr)] gap-5 lg:grid-cols-3">
            {brandCards.map((card, index) => (
              <motion.article
                key={card.title}
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className={`group relative overflow-hidden rounded-[2rem] border border-white/10 bg-page-soft p-6 ${card.size}`}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,153,95,0.16),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent)]" />
                <div className="absolute -right-10 top-8 h-40 w-40 rounded-full bg-copper/10 blur-3xl transition-transform duration-500 group-hover:scale-125" />
                <div className="absolute bottom-0 left-0 h-28 w-full bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.24))]" />

                <div className="relative flex h-full flex-col justify-between">
                  <div className="text-xs uppercase tracking-[0.24em] text-sand/70">
                    0{index + 1}
                  </div>
                  <div>
                    <h4 className="text-3xl font-semibold tracking-[-0.04em] text-cream">
                      {card.title}
                    </h4>
                    <p className="mt-3 max-w-md text-sm leading-6 text-sand/72">
                      {card.description}
                    </p>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
