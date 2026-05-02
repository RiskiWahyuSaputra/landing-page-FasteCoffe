import AdminMenuManager from "@/components/admin/AdminMenuManager";
import { requireAdminSession } from "@/lib/admin-session";
import { getAdminDashboard, getAdminMenuItems } from "@/lib/laravel-admin-api";

export default async function AdminMenuPage() {
  const { token } = await requireAdminSession();
  const [dashboard, menuItems] = await Promise.all([
    getAdminDashboard(token),
    getAdminMenuItems(token),
  ]);

  return (
    <section className="flex min-h-[calc(100vh-2rem)] flex-col gap-5">
      {/* ── Page Header ── */}
      <header className="glass-panel grain-overlay rounded-[1.8rem] border border-white/10 px-4 py-5 sm:px-6 md:px-8">
        <div className="flex flex-col gap-4 sm:gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="section-label">Menu Management</p>
            <h1 className="text-[clamp(1.5rem,4vw,3.2rem)] font-semibold leading-[1.05] tracking-[-0.05em] text-cream">
              Publish &amp; manage drinks
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-sand/65">
              Data yang kamu ubah di sini menjadi sumber utama untuk section
              menu pada landing page.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:flex sm:gap-3">
            <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] px-3 py-2.5 text-center sm:px-4 sm:py-3.5">
              <p className="text-xs uppercase tracking-[0.22em] text-sand/50">
                Total Menu
              </p>
              <p className="mt-1 text-xl font-semibold tracking-[-0.04em] text-cream sm:mt-1.5 sm:text-2xl">
                {dashboard.stats.total_menu_items}
              </p>
            </div>
            <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] px-3 py-2.5 text-center sm:px-4 sm:py-3.5">
              <p className="text-xs uppercase tracking-[0.22em] text-sand/50">
                Sessions
              </p>
              <p className="mt-1 text-xl font-semibold tracking-[-0.04em] text-cream sm:mt-1.5 sm:text-2xl">
                {dashboard.stats.active_admin_sessions}
              </p>
            </div>
            <div className="rounded-[1.2rem] border border-copper/25 bg-[rgba(212,153,95,0.08)] px-3 py-2.5 text-center sm:px-4 sm:py-3.5">
              <p className="text-xs uppercase tracking-[0.22em] text-sand/50">
                Status
              </p>
              <p className="mt-1 text-xl font-semibold capitalize tracking-[-0.04em] text-copper sm:mt-1.5 sm:text-2xl">
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
