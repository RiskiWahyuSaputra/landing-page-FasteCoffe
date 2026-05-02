"use client";

import { useLocale } from "@/components/LocaleProvider";

export default function Footer() {
  const { t } = useLocale();

  return (
    <footer className="border-t border-white/10 px-6 py-10 md:px-10">
      <div className="page-shell flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-lg font-semibold uppercase tracking-[0.38em] text-cream">
            Faste Coffee
          </p>
          <p className="mt-3 max-w-md text-sm leading-6 text-sand/68">
            {t("footer_description")}
          </p>
        </div>

        <div className="flex flex-col gap-4 text-sm text-sand/70 md:flex-row md:items-center md:gap-8">
          <a href="https://instagram.com" target="_blank" rel="noreferrer">
            Instagram
          </a>
          <a href="https://tiktok.com" target="_blank" rel="noreferrer">
            TikTok
          </a>
          <a href="https://x.com" target="_blank" rel="noreferrer">
            X
          </a>
          <span className="md:ml-4">{t("copyright")}</span>
        </div>
      </div>
    </footer>
  );
}
