"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { AdminUser } from "@/lib/laravel-admin-api";

import AdminLogoutButton from "@/components/admin/AdminLogoutButton";

const navigation = [
  {
    href: "/admin/dashboard",
    label: "Overview",
    description: "Operational snapshot"
  },
  {
    href: "/admin/menu",
    label: "Menu",
    description: "Add and manage drinks"
  },
  {
    href: "/admin/purchases",
    label: "Purchases",
    description: "Checkout history"
  }
];

export default function AdminSidebar({ user }: { user: AdminUser }) {
  const pathname = usePathname();

  return (
    <>
      <aside className="glass-panel hidden w-[290px] shrink-0 flex-col rounded-[2rem] border border-white/10 p-5 shadow-halo lg:flex">
        <div className="rounded-[1.6rem] border border-white/10 bg-[linear-gradient(135deg,rgba(212,153,95,0.14),rgba(255,255,255,0.03))] p-5">
          <p className="text-xs uppercase tracking-[0.32em] text-sand/58">
            Admin Suite
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-cream">
            Faste.
          </h1>
          <p className="mt-3 text-sm leading-6 text-sand/72">
            Coffee operations desk for menu publishing and backend monitoring.
          </p>
        </div>

        <nav className="mt-6 space-y-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-[1.4rem] border px-4 py-4 transition ${
                  isActive
                    ? "border-copper/40 bg-[rgba(212,153,95,0.12)]"
                    : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium uppercase tracking-[0.18em] text-cream">
                      {item.label}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-sand/68">
                      {item.description}
                    </p>
                  </div>
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      isActive ? "bg-copper" : "bg-white/20"
                    }`}
                  />
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-5">
          <p className="text-xs uppercase tracking-[0.28em] text-sand/58">
            Signed in as
          </p>
          <p className="mt-3 text-xl font-semibold tracking-[-0.04em] text-cream">
            {user.name}
          </p>
          <p className="mt-2 break-all text-sm leading-6 text-sand/68">
            {user.email}
          </p>
        </div>

        <div className="mt-auto flex flex-col gap-3 pt-6">
          <Link
            href="/"
            className="rounded-full border border-white/10 px-5 py-3 text-center text-xs uppercase tracking-[0.24em] text-sand transition hover:border-copper/50 hover:text-white"
          >
            View Website
          </Link>
          <AdminLogoutButton />
        </div>
      </aside>

      <div className="mb-6 flex gap-3 overflow-x-auto pb-1 lg:hidden">
        {navigation.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`min-w-max rounded-full border px-4 py-3 text-xs uppercase tracking-[0.24em] transition ${
                isActive
                  ? "border-copper/40 bg-[rgba(212,153,95,0.12)] text-copper"
                  : "border-white/10 bg-white/[0.03] text-sand"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </>
  );
}
