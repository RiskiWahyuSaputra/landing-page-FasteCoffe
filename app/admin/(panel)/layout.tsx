import type { ReactNode } from "react";

import AdminSidebar from "@/components/admin/AdminSidebar";
import { requireAdminSession } from "@/lib/admin-session";

export default async function AdminPanelLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user } = await requireAdminSession();

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#120b07]">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(212,153,95,0.14),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(89,49,28,0.22),transparent_34%),linear-gradient(180deg,#130c08_0%,#0c0806_100%)]" />
      <div className="absolute left-[8%] top-20 h-72 w-72 rounded-full bg-copper/8 blur-3xl" />
      <div className="absolute bottom-20 right-[5%] h-80 w-80 rounded-full bg-[#6d3c1f]/15 blur-3xl" />

      <div className="relative mx-auto flex w-full gap-4 px-3 py-3 sm:gap-5 sm:px-4 sm:py-4 md:px-6 lg:px-8 xl:max-w-[1600px]">
        <AdminSidebar user={user} />
        <div className="min-w-0 flex-1 pb-4 sm:pb-8">{children}</div>
      </div>
    </main>
  );
}
