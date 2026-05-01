import Link from "next/link";

import { requireAdminSession } from "@/lib/admin-session";
import { getAdminDashboard, getAdminMenuItems } from "@/lib/laravel-admin-api";

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export default async function AdminDashboardPage() {
  const { token, user } = await requireAdminSession();
  const [data, menuItems] = await Promise.all([
    getAdminDashboard(token),
    getAdminMenuItems(token)
  ]);

  const latestMenus = menuItems.slice(-3).reverse();

  return (
    <section className="flex min-h-[calc(100vh-2rem)] flex-col gap-6">
      <header className="glass-panel grain-overlay rounded-[2rem] border border-white/10 px-6 py-6 md:px-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="section-label">Overview</p>
            <h1 className="text-[clamp(2.6rem,5vw,4.8rem)] font-semibold leading-[0.92] tracking-[-0.06em] text-cream">
              A sharper admin cockpit for Faste Coffee operations.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-sand/70">
              Selamat datang, {user.name}. Sekarang dashboard admin dipisah
              menjadi halaman overview dan menu management supaya alurnya lebih
              rapi dan profesional.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/admin/menu"
              className="rounded-full border border-copper/40 bg-copper px-5 py-3 text-center text-xs uppercase tracking-[0.24em] text-[#1a0f09] transition hover:bg-[#e2a86d]"
            >
              Manage Menu
            </Link>
            <Link
              href="/admin/purchases"
              className="rounded-full border border-white/10 px-5 py-3 text-center text-xs uppercase tracking-[0.24em] text-sand transition hover:border-copper/50 hover:text-white"
            >
              View Purchases
            </Link>
            <Link
              href="/"
              className="rounded-full border border-white/10 px-5 py-3 text-center text-xs uppercase tracking-[0.24em] text-sand transition hover:border-copper/50 hover:text-white sm:col-span-2"
            >
              Open Website
            </Link>
          </div>
        </div>
      </header>

      <section className="grid gap-5 md:grid-cols-2 2xl:grid-cols-6">
        <article className="glass-panel rounded-[1.8rem] border border-white/10 p-5">
          <p className="text-xs uppercase tracking-[0.28em] text-sand/60">
            Total Users
          </p>
          <p className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-cream">
            {data.stats.total_users}
          </p>
        </article>
        <article className="glass-panel rounded-[1.8rem] border border-white/10 p-5">
          <p className="text-xs uppercase tracking-[0.28em] text-sand/60">
            Admin Accounts
          </p>
          <p className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-cream">
            {data.stats.total_admins}
          </p>
        </article>
        <article className="glass-panel rounded-[1.8rem] border border-white/10 p-5">
          <p className="text-xs uppercase tracking-[0.28em] text-sand/60">
            Menu Items
          </p>
          <p className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-cream">
            {data.stats.total_menu_items}
          </p>
        </article>
        <article className="glass-panel rounded-[1.8rem] border border-white/10 p-5">
          <p className="text-xs uppercase tracking-[0.28em] text-sand/60">
            Total Orders
          </p>
          <p className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-cream">
            {data.stats.total_orders}
          </p>
        </article>
        <article className="glass-panel rounded-[1.8rem] border border-white/10 p-5">
          <p className="text-xs uppercase tracking-[0.28em] text-sand/60">
            Active Sessions
          </p>
          <p className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-cream">
            {data.stats.active_admin_sessions}
          </p>
        </article>
        <article className="glass-panel rounded-[1.8rem] border border-white/10 p-5">
          <p className="text-xs uppercase tracking-[0.28em] text-sand/60">
            Backend Status
          </p>
          <p className="mt-4 text-4xl font-semibold capitalize tracking-[-0.05em] text-copper">
            {data.stats.backend_status}
          </p>
        </article>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="glass-panel rounded-[2rem] border border-white/10 p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-sand/60">
                Session Overview
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-cream">
                Access timeline
              </h2>
            </div>
            <p className="text-sm leading-6 text-sand/68">
              Live snapshot from Laravel admin token session.
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-sand/55">
                Issued
              </p>
              <p className="mt-3 text-lg font-medium text-cream">
                {formatDate(data.session.issued_at)}
              </p>
            </div>
            <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-sand/55">
                Last Used
              </p>
              <p className="mt-3 text-lg font-medium text-cream">
                {formatDate(data.session.last_used_at)}
              </p>
            </div>
            <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-sand/55">
                Expires
              </p>
              <p className="mt-3 text-lg font-medium text-cream">
                {formatDate(data.session.expires_at)}
              </p>
            </div>
          </div>
        </article>

        <article className="glass-panel rounded-[2rem] border border-white/10 p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-sand/60">
            Recently Published
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-cream">
            Menu pulse
          </h2>

          <div className="mt-6 space-y-4">
            {latestMenus.map((item) => (
              <div
                key={item.id}
                className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-cream">{item.name}</p>
                    <p className="mt-2 text-sm leading-6 text-sand/68">
                      {item.description}
                    </p>
                  </div>
                  <div
                    className={`h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br ${item.accent}`}
                  >
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/admin/menu"
            className="mt-6 inline-flex rounded-full border border-white/10 px-5 py-3 text-xs uppercase tracking-[0.24em] text-sand transition hover:border-copper/50 hover:text-white"
          >
            Open Menu Page
          </Link>
        </article>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <article className="glass-panel rounded-[2rem] border border-white/10 p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-sand/60">
            Environment
          </p>
          <div className="mt-6 space-y-4">
            <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-sand/55">
                App
              </p>
              <p className="mt-2 text-xl font-medium text-cream">
                {data.meta.app_name}
              </p>
            </div>
            <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-sand/55">
                Environment
              </p>
              <p className="mt-2 text-xl font-medium uppercase text-cream">
                {data.meta.environment}
              </p>
            </div>
            <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-sand/55">
                Server Time
              </p>
              <p className="mt-2 text-xl font-medium text-cream">
                {formatDate(data.meta.server_time)}
              </p>
            </div>
          </div>
        </article>

        <article className="glass-panel rounded-[2rem] border border-white/10 p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-sand/60">
            Workflow
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-cream">
            Publishing flow
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-sand/55">
                01
              </p>
              <p className="mt-3 text-lg font-medium text-cream">Create menu</p>
              <p className="mt-2 text-sm leading-6 text-sand/68">
                Tambahkan minuman baru dari halaman menu admin.
              </p>
            </div>
            <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-sand/55">
                02
              </p>
              <p className="mt-3 text-lg font-medium text-cream">Sync landing</p>
              <p className="mt-2 text-sm leading-6 text-sand/68">
                Homepage Next.js membaca daftar menu terbaru dari Laravel API.
              </p>
            </div>
            <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-sand/55">
                03
              </p>
              <p className="mt-3 text-lg font-medium text-cream">Ready to sell</p>
              <p className="mt-2 text-sm leading-6 text-sand/68">
                Produk baru langsung tampil untuk pembeli di halaman depan.
              </p>
            </div>
          </div>
        </article>
      </section>
    </section>
  );
}
