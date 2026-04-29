export default function Footer() {
  return (
    <footer className="border-t border-white/10 px-6 py-10 md:px-10">
      <div className="page-shell flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-lg font-semibold uppercase tracking-[0.38em] text-cream">
            Faste Coffee
          </p>
          <p className="mt-3 max-w-md text-sm leading-6 text-sand/68">
            Brewed for your daily energy. Crafted for modern routines, premium taste,
            and a pace that still feels human.
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
          <span>Copyright 2026 Faste Coffee</span>
        </div>
      </div>
    </footer>
  );
}
