import Link from "next/link";

import { requireAdminSession } from "@/lib/admin-session";
import { getAdminDashboard, getAdminMenuItems } from "@/lib/laravel-admin-api";

function formatDate(value: string | null) {
  if (!value) {
    return "–";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

const StatIcon = ({ children }: { children: React.ReactNode }) => (
  <div className="flex h-10 w-10 items-center justify-center rounded-[0.85rem] bg-white/[0.06] text-sand/60">
    {children}
  </div>
);

export default async function AdminDashboardPage() {
  const { token, user } = await requireAdminSession();
  const [data, menuItems] = await Promise.all([
    getAdminDashboard(token),
    getAdminMenuItems(token),
  ]);

  const latestMenus = menuItems.slice(-3).reverse();

  const stats = [
    {
      label: "Total Users",
      value: data.stats.total_users,
      accent: false,
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 00-3-3.87" />
          <path d="M16 3.13a4 4 0 010 7.75" />
        </svg>
      ),
    },
    {
      label: "Admin Accounts",
      value: data.stats.total_admins,
      accent: false,
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
    },
    {
      label: "Menu Items",
      value: data.stats.total_menu_items,
      accent: false,
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8h1a4 4 0 010 8h-1" />
          <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
          <line x1="6" y1="1" x2="6" y2="4" />
          <line x1="10" y1="1" x2="10" y2="4" />
          <line x1="14" y1="1" x2="14" y2="4" />
        </svg>
      ),
    },
    {
      label: "Total Orders",
      value: data.stats.total_orders,
      accent: false,
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 01-8 0" />
        </svg>
      ),
    },
    {
      label: "Active Sessions",
      value: data.stats.active_admin_sessions,
      accent: false,
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
    {
      label: "Backend Status",
      value: data.stats.backend_status,
      accent: true,
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
    },
  ];

  return (
    <section className="flex min-h-[calc(100vh-2rem)] flex-col gap-5">
      {/* ── Page Header ── */}
      <header className="glass-panel grain-overlay rounded-[1.8rem] border border-white/10 px-4 py-5 sm:px-6 md:px-8">
        <div className="flex flex-col gap-4 sm:gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="section-label">Overview</p>
            <h1 className="text-[clamp(1.5rem,4vw,3.4rem)] font-semibold leading-[1.05] tracking-[-0.05em] text-cream">
              Admin Cockpit
            </h1>
            <p className="mt-2 text-sm leading-6 text-sand/65">
              Selamat datang,{" "}
              <span className="font-medium text-cream">{user.name}</span>. Semua
              operasional Faste Coffee terkontrol dari sini.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/menu"
              className="inline-flex items-center gap-2 rounded-full border border-copper/40 bg-copper px-4 py-2 text-xs font-medium uppercase tracking-[0.22em] text-[#1a0f09] transition hover:bg-[#e2a86d] sm:px-5 sm:py-2.5"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Manage Menu
            </Link>
            <Link
              href="/admin/purchases"
              className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-xs font-medium uppercase tracking-[0.22em] text-sand transition hover:border-copper/30 hover:text-white sm:px-5 sm:py-2.5"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
              </svg>
              View Purchases
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-xs font-medium uppercase tracking-[0.22em] text-sand transition hover:border-copper/30 hover:text-white sm:px-5 sm:py-2.5"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              Open Website
            </Link>
          </div>
        </div>
      </header>

      {/* ── Stats Grid ── */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-6">
        {stats.map((stat) => (
          <article
            key={stat.label}
            className={`glass-panel rounded-[1.5rem] border p-5 ${
              stat.accent
                ? "border-copper/25 bg-[rgba(212,153,95,0.07)]"
                : "border-white/10"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-[0.85rem] ${stat.accent ? "bg-copper/15 text-copper" : "bg-white/[0.06] text-sand/60"}`}
              >
                {stat.icon}
              </div>
            </div>
            <p
              className={`mt-4 text-3xl font-semibold capitalize tracking-[-0.05em] ${stat.accent ? "text-copper" : "text-cream"}`}
            >
              {stat.value}
            </p>
            <p className="mt-1.5 text-xs uppercase tracking-[0.24em] text-sand/55">
              {stat.label}
            </p>
          </article>
        ))}
      </div>

      {/* ── Session + Menu Pulse ── */}
      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        {/* Session Overview */}
        <article className="glass-panel rounded-[1.8rem] border border-white/10 p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-sand/55">
                Session Overview
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-cream">
                Access timeline
              </h2>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <p className="text-xs font-medium text-emerald-400">Active</p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              { label: "Issued", value: formatDate(data.session.issued_at) },
              {
                label: "Last Used",
                value: formatDate(data.session.last_used_at),
              },
              { label: "Expires", value: formatDate(data.session.expires_at) },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] p-4"
              >
                <p className="text-xs uppercase tracking-[0.22em] text-sand/50">
                  {item.label}
                </p>
                <p className="mt-2 text-sm font-medium leading-6 text-cream">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </article>

        {/* Menu Pulse */}
        <article className="glass-panel rounded-[1.8rem] border border-white/10 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-sand/55">
                Recently Published
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-cream">
                Menu pulse
              </h2>
            </div>
            <Link
              href="/admin/menu"
              className="shrink-0 rounded-full border border-white/10 px-3.5 py-1.5 text-xs uppercase tracking-[0.2em] text-sand transition hover:border-copper/40 hover:text-white"
            >
              View All
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {latestMenus.length === 0 ? (
              <p className="py-4 text-center text-sm text-sand/55">
                Belum ada menu yang ditambahkan.
              </p>
            ) : (
              latestMenus.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3.5 rounded-[1.2rem] border border-white/10 bg-white/[0.02] p-3.5"
                >
                  <div
                    className={`h-12 w-12 shrink-0 overflow-hidden rounded-[0.85rem] bg-gradient-to-br ${item.accent}`}
                  >
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-cream">
                      {item.name}
                    </p>
                    <p className="mt-0.5 line-clamp-1 text-xs text-sand/60">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>
      </div>

      {/* ── Environment + Workflow ── */}
      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        {/* Environment */}
        <article className="glass-panel rounded-[1.8rem] border border-white/10 p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-sand/55">
            Environment
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-cream">
            System config
          </h2>

          <div className="mt-5 space-y-3">
            {[
              { label: "Application", value: data.meta.app_name },
              {
                label: "Environment",
                value: data.meta.environment,
                mono: true,
              },
              {
                label: "Server Time",
                value: formatDate(data.meta.server_time),
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between gap-4 rounded-[1.2rem] border border-white/10 bg-white/[0.03] px-4 py-3.5"
              >
                <p className="text-xs uppercase tracking-[0.22em] text-sand/50">
                  {item.label}
                </p>
                <p
                  className={`text-sm font-medium text-cream ${item.mono ? "font-mono uppercase" : ""}`}
                >
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </article>

        {/* Publishing Workflow */}
        <article className="glass-panel rounded-[1.8rem] border border-white/10 p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-sand/55">
            Workflow
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-cream">
            Publishing flow
          </h2>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              {
                step: "01",
                title: "Create menu",
                desc: "Tambahkan minuman baru dari halaman menu admin.",
              },
              {
                step: "02",
                title: "Sync landing",
                desc: "Homepage Next.js membaca daftar menu terbaru dari Laravel API.",
              },
              {
                step: "03",
                title: "Ready to sell",
                desc: "Produk baru langsung tampil untuk pembeli di halaman depan.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] p-4"
              >
                <p className="font-mono text-xs text-copper/70">{item.step}</p>
                <p className="mt-2.5 text-sm font-semibold text-cream">
                  {item.title}
                </p>
                <p className="mt-1.5 text-xs leading-5 text-sand/60">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
