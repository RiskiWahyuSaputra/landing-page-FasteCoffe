import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import AdminLoginForm from "@/components/admin/AdminLoginForm";
import { ADMIN_AUTH_COOKIE } from "@/lib/admin-auth";
import { getAdminProfile } from "@/lib/laravel-admin-api";

export default async function AdminLoginPage() {
  const token = cookies().get(ADMIN_AUTH_COOKIE)?.value;

  if (token) {
    try {
      await getAdminProfile(token);
      redirect("/admin/dashboard");
    } catch {
      // Invalid cookies are ignored and the login form is shown again.
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#120b07]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(127,150,97,0.2),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(91,63,42,0.24),transparent_35%),linear-gradient(180deg,#17120e_0%,#100c09_100%)]" />
      <div className="absolute left-[-10%] top-20 h-64 w-64 rounded-full bg-copper/10 blur-3xl" />
      <div className="absolute bottom-10 right-[-8%] h-72 w-72 rounded-full bg-[#8a4b25]/20 blur-3xl" />

      <section className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center gap-10 px-6 py-16 md:px-10 lg:flex-row lg:items-center lg:gap-16">
        <div className="max-w-xl">
          <p className="section-label">Akses Admin</p>
          <h1 className="text-balance text-[clamp(3rem,8vw,6.5rem)] font-semibold leading-[0.9] tracking-[-0.06em] text-cream">
            Ruang kontrol untuk backend Faste Coffee.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-sand/72">
            Halaman publik tetap berjalan di Next.js, sementara area admin
            ini masuk lewat autentikasi Laravel yang terhubung ke dashboard
            internal.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="glass-panel rounded-[1.8rem] border border-white/10 p-5">
              <p className="text-xs uppercase tracking-[0.28em] text-sand/60">
                Frontend
              </p>
              <p className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-cream">
                Next.js 14
              </p>
            </div>
            <div className="glass-panel rounded-[1.8rem] border border-white/10 p-5">
              <p className="text-xs uppercase tracking-[0.28em] text-sand/60">
                Backend
              </p>
              <p className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-cream">
                Laravel 12 API
              </p>
            </div>
          </div>
        </div>

        <AdminLoginForm />
      </section>
    </main>
  );
}
