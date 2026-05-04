"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";

import { type CartMenuItem, useCart } from "@/components/CartProvider";
import { useLocale } from "@/components/LocaleProvider";
import {
  MENU_CATEGORIES,
  type MenuCategory,
  getMenuCategoryTranslationKey,
} from "@/lib/menu-category";

export default function Menu({ menuItems }: { menuItems: CartMenuItem[] }) {
  const { addItem, decreaseItem, increaseItem, items } = useCart();
  const { t } = useLocale();
  const [activeCategory, setActiveCategory] = useState<"all" | MenuCategory>("all");

  const brandCards = [
    {
      title: t("brand_card_title_1"),
      description: t("brand_card_desc_1"),
      size: "lg:col-span-2",
      imageSrc: "/images/bijikopi.jpg",
      imageClassName: "object-cover object-[center_32%] scale-[1.08]",
    },
    {
      title: t("brand_card_title_2"),
      description: t("brand_card_desc_2"),
      size: "",
      imageSrc: "/images/prosesbrewing.jpg",
      imageClassName: "object-cover object-[52%_40%] scale-[1.16]",
    },
    {
      title: t("brand_card_title_3"),
      description: t("brand_card_desc_3"),
      size: "",
      imageSrc: "/images/vibes.png",
      imageClassName: "object-cover object-[48%_44%] scale-[1.12]",
    },
    {
      title: t("brand_card_title_4"),
      description: t("brand_card_desc_4"),
      size: "lg:col-span-2",
      imageSrc: "/images/barista.jpg",
      imageClassName: "object-cover object-[55%_28%] scale-[1.12]",
    },
  ];

  const quantitiesByName = items.reduce<Record<string, number>>(
    (accumulator, item) => {
      accumulator[item.name] = item.quantity;
      return accumulator;
    },
    {},
  );

  const filteredMenuItems =
    activeCategory === "all"
      ? menuItems
      : menuItems.filter((item) => item.category === activeCategory);

  const filterOptions = [
    { value: "all" as const, label: t("menu_filter_all") },
    ...MENU_CATEGORIES.map((category) => ({
      value: category,
      label: t(getMenuCategoryTranslationKey(category)),
    })),
  ];

  return (
    <section
      id="menu"
      className="relative overflow-hidden px-6 py-28 md:px-10 md:py-40"
    >
      <div className="page-shell">
        <div className="mb-14 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="section-label">{t("popular_menu")}</p>
            <h2 className="text-balance text-[clamp(2.5rem,6vw,5.2rem)] font-semibold leading-[0.94] tracking-[-0.05em] text-cream">
              {t("menu_subtitle")}
            </h2>
          </div>

          <p className="max-w-md text-base leading-7 text-sand/72">
            {t("menu_description")}
          </p>
        </div>

        <div className="mb-8 flex flex-wrap gap-3">
          {filterOptions.map((option) => {
            const isActive = option.value === activeCategory;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setActiveCategory(option.value)}
                className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.22em] transition ${
                  isActive
                    ? "border-copper bg-copper text-ink"
                    : "theme-pill text-sand hover:border-copper/40 hover:text-cream"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        {filteredMenuItems.length ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredMenuItems.map((item, index) =>
            (() => {
              const quantity = quantitiesByName[item.name] ?? 0;
              const categoryLabel = t(
                getMenuCategoryTranslationKey(item.category),
              );

              return (
                <motion.article
                  key={item.name}
                  whileHover={{ y: -10, scale: 1.01 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="group glass-panel grain-overlay relative overflow-hidden rounded-[2rem] border p-5 shadow-halo"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(124,147,82,0.22),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(123,83,52,0.18),transparent_38%)] opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />

                  <div
                    className={`relative aspect-[4/3] overflow-hidden rounded-[1.6rem] bg-gradient-to-br ${item.accent}`}
                  >
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,5,3,0.1),rgba(9,5,3,0.34))]" />
                    {!item.imageUrl ? (
                      <>
                        <div className="absolute inset-x-8 bottom-6 top-8 rounded-[40%] border border-white/12 bg-white/[0.04] blur-[1px]" />
                        <div className="absolute left-1/2 top-[18%] h-28 w-28 -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />
                        <div className="absolute inset-x-12 bottom-10 h-12 rounded-full border border-white/15 bg-black/20 blur-sm" />
                        <div className="absolute left-1/2 top-10 h-28 w-28 -translate-x-1/2 rounded-full border border-white/15 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.22),rgba(255,255,255,0.05)_40%,transparent_70%)]" />
                        <div className="absolute inset-x-[30%] bottom-12 top-[33%] rounded-b-[2.4rem] rounded-t-[1rem] border border-white/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0.04))]" />
                      </>
                    ) : null}
                    <div className="absolute bottom-4 left-4 rounded-full border border-[rgba(243,234,216,0.12)] bg-[rgba(22,17,12,0.56)] px-3 py-1 text-[0.68rem] uppercase tracking-[0.26em] text-sand/82 backdrop-blur-sm">
                      {t("menu_item")} {index + 1}
                    </div>
                    <div className="absolute left-4 top-4 rounded-full border border-[rgba(243,234,216,0.12)] bg-[rgba(22,17,12,0.6)] px-3 py-1 text-[0.68rem] uppercase tracking-[0.24em] text-cream backdrop-blur-sm">
                      {categoryLabel}
                    </div>
                    {quantity ? (
                      <div className="absolute right-4 top-4 rounded-full border border-copper/30 bg-copper/16 px-3 py-1 text-[0.68rem] uppercase tracking-[0.24em] text-copper">
                        {t("in_cart")} x{quantity}
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
                    <span className="theme-pill rounded-full border px-3 py-1 text-xs uppercase tracking-[0.22em] text-copper">
                      {item.price}
                    </span>
                  </div>

                  <div className="relative mt-6 flex items-center justify-between gap-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-sand/64">
                      {categoryLabel}
                    </p>

                    <div className="flex items-center gap-2 rounded-full border border-copper/30 bg-copper/12 p-1">
                      <button
                        type="button"
                        onClick={() => decreaseItem(item.name)}
                        disabled={!quantity}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-lg text-copper transition hover:bg-copper hover:text-ink disabled:cursor-not-allowed disabled:opacity-35"
                        aria-label={t("decrease")}
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
                        className="flex h-9 w-9 items-center justify-center rounded-full text-lg text-copper transition hover:bg-copper hover:text-ink"
                        aria-label={t("increase")}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </motion.article>
              );
            })(),
            )}
          </div>
        ) : (
          <div className="glass-panel rounded-[2rem] border px-6 py-10 text-center">
            <p className="text-xs uppercase tracking-[0.28em] text-sand/58">
              {t("popular_menu")}
            </p>
            <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-cream">
              {t("menu_empty_category")}
            </h3>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-sand/70">
              {t("menu_empty_category_desc")}
            </p>
          </div>
        )}

        <div className="mt-28">
          <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="section-label">{t("brand_layers")}</p>
              <h3 className="text-balance text-[clamp(2rem,5vw,4rem)] font-semibold leading-[0.96] tracking-[-0.05em] text-cream">
                {t("brand_layers_title")}
              </h3>
            </div>

            <p className="max-w-md text-sm leading-6 text-sand/70">
              {t("brand_layers_desc")}
            </p>
          </div>

          <div className="grid auto-rows-[minmax(240px,1fr)] gap-5 lg:grid-cols-3">
            {brandCards.map((card, index) => (
              <motion.article
                key={card.title}
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className={`group theme-surface-strong relative overflow-hidden rounded-[2rem] border p-6 ${card.size}`}
              >
                <div className="absolute inset-0">
                  <Image
                    src={card.imageSrc}
                    alt={card.title}
                    fill
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className={`opacity-58 transition-transform duration-700 group-hover:scale-110 ${card.imageClassName}`}
                  />
                </div>
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,6,4,0.28)_0%,rgba(10,6,4,0.4)_22%,rgba(10,6,4,0.82)_72%,rgba(10,6,4,0.95)_100%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(127,150,97,0.22),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent)]" />
                <div className="absolute -right-10 top-8 h-40 w-40 rounded-full bg-copper/10 blur-3xl transition-transform duration-500 group-hover:scale-125" />
                <div className="absolute bottom-0 left-0 h-28 w-full bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.24))]" />

                <div className="relative flex h-full flex-col justify-between">
                  <div className="text-xs uppercase tracking-[0.24em] text-sand/70">
                    0{index + 1}
                  </div>
                  <div className="max-w-[34rem]">
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
