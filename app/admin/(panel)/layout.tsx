import type { ReactNode } from "react";

import AdminSidebar from "@/components/admin/AdminSidebar";
import { requireAdminSession } from "@/lib/admin-session";

export default async function AdminPanelLayout({
  children
}: {
  children: ReactNode;
}) {
  const { user } = await requireAdminSession();

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#120b07]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(212,153,95,0.18),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(89,49,28,0.28),transparent_34%),linear-gradient(180deg,#130c08_0%,#0c0806_100%)]" />
      <div className="absolute left-[8%] top-20 h-64 w-64 rounded-full bg-copper/10 blur-3xl" />
      <div className="absolute bottom-10 right-[5%] h-72 w-72 rounded-full bg-[#6d3c1f]/20 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1600px] gap-6 px-4 py-4 md:px-6 lg:px-8">
        <AdminSidebar user={user} />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </main>
  );
}
