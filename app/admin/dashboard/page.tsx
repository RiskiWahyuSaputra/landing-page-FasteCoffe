import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import AdminLogoutButton from "@/components/admin/AdminLogoutButton";
import { ADMIN_AUTH_COOKIE } from "@/lib/admin-auth";
import { getAdminDashboard } from "@/lib/laravel-admin-api";

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
  const token = cookies().get(ADMIN_AUTH_COOKIE)?.value;

  if (!token) {
    redirect("/admin/login");
  }

  try {
    const data = await getAdminDashboard(token);

    return (
      <main className="relative min-h-screen overflow-hidden bg-[#120b07] px-6 py-8 md:px-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,153,95,0.18),transparent_32%),linear-gradient(180deg,#120b07_0%,#0b0705_100%)]" />

        <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-8">
          <header className="glass-panel grain-overlay rounded-[2rem] border border-white/10 px-6 py-6 md:px-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="section-label">Admin Dashboard</p>
                <h1 className="text-[clamp(2.6rem,6vw,5rem)] font-semibold leading-[0.92] tracking-[-0.06em] text-cream">
                  Brew operations, auth health, and backend status in one view.
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-sand/70">
                  Selamat datang, {data.user.name}. Panel ini sekarang sudah
                  berjalan di Next.js dengan autentikasi dari Laravel API.
                </p>
              </div>

              <AdminLogoutButton />
            </div>
          </header>

          <section className="grid gap-5 lg:grid-cols-4">
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

          <section className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
            <article className="glass-panel rounded-[2rem] border border-white/10 p-6">
              <p className="text-xs uppercase tracking-[0.28em] text-sand/60">
                Session Overview
              </p>
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
          </section>
        </div>
      </main>
    );
  } catch {
    redirect("/admin/login");
  }
}
