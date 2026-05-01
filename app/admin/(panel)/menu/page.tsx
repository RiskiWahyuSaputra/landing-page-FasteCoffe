import AdminMenuManager from "@/components/admin/AdminMenuManager";
import { requireAdminSession } from "@/lib/admin-session";
import { getAdminDashboard, getAdminMenuItems } from "@/lib/laravel-admin-api";

export default async function AdminMenuPage() {
  const { token } = await requireAdminSession();
  const [dashboard, menuItems] = await Promise.all([
    getAdminDashboard(token),
    getAdminMenuItems(token)
  ]);

  return (
    <section className="flex min-h-[calc(100vh-2rem)] flex-col gap-6">
      <header className="glass-panel grain-overlay rounded-[2rem] border border-white/10 px-6 py-6 md:px-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="section-label">Menu Management</p>
            <h1 className="text-[clamp(2.6rem,5vw,4.8rem)] font-semibold leading-[0.92] tracking-[-0.06em] text-cream">
              Publish, review, and shape the drinks shown on the front page.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-sand/70">
              Halaman ini khusus untuk penambahan menu. Data yang kamu ubah di
              sini menjadi sumber utama untuk section menu pada landing page.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] px-4 py-4">
              <p className="text-xs uppercase tracking-[0.24em] text-sand/58">
                Total Menu
              </p>
              <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-cream">
                {dashboard.stats.total_menu_items}
              </p>
            </div>
            <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] px-4 py-4">
              <p className="text-xs uppercase tracking-[0.24em] text-sand/58">
                Sessions
              </p>
              <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-cream">
                {dashboard.stats.active_admin_sessions}
              </p>
            </div>
            <div className="rounded-[1.4rem] border border-copper/25 bg-[rgba(212,153,95,0.1)] px-4 py-4">
              <p className="text-xs uppercase tracking-[0.24em] text-sand/58">
                Status
              </p>
              <p className="mt-3 text-3xl font-semibold capitalize tracking-[-0.04em] text-copper">
                {dashboard.stats.backend_status}
              </p>
            </div>
          </div>
        </div>
      </header>

      <AdminMenuManager initialItems={menuItems} />
    </section>
  );
}
