"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

import type { AdminUser } from "@/lib/laravel-admin-api";

import AdminLogoutButton from "@/components/admin/AdminLogoutButton";

const navigation = [
  {
    href: "/admin/dashboard",
    label: "Overview",
    description: "Operational snapshot",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    )
  },
  {
    href: "/admin/menu",
    label: "Menu",
    description: "Add and manage drinks",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
        <line x1="6" y1="1" x2="6" y2="4" />
        <line x1="10" y1="1" x2="10" y2="4" />
        <line x1="14" y1="1" x2="14" y2="4" />
      </svg>
    )
  },
  {
    href: "/admin/purchases",
    label: "Purchases",
    description: "Checkout history",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 01-8 0" />
      </svg>
    )
  }
];

export default function AdminSidebar({ user }: { user: AdminUser }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = user.name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside className="glass-panel hidden w-[270px] shrink-0 flex-col rounded-[2rem] border border-white/10 p-5 shadow-halo lg:flex" style={{ height: "calc(100vh - 2rem)", position: "sticky", top: "1rem" }}>
        {/* Brand */}
        <div className="rounded-[1.6rem] border border-white/10 bg-[linear-gradient(135deg,rgba(212,153,95,0.16),rgba(255,255,255,0.03))] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-[0.75rem] bg-copper/20">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d4995f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                <line x1="6" y1="1" x2="6" y2="4" />
                <line x1="10" y1="1" x2="10" y2="4" />
                <line x1="14" y1="1" x2="14" y2="4" />
              </svg>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-sand/55">Admin Suite</p>
              <h2 className="text-lg font-semibold tracking-[-0.04em] text-cream">Faste Coffee</h2>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-5 space-y-2">
          <p className="mb-3 px-1 text-[0.65rem] uppercase tracking-[0.32em] text-sand/40">Navigation</p>
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3.5 rounded-[1.2rem] border px-4 py-3.5 transition-all duration-200 ${
                  isActive
                    ? "border-copper/35 bg-[rgba(212,153,95,0.12)] text-copper"
                    : "border-transparent text-sand/70 hover:border-white/10 hover:bg-white/[0.04] hover:text-cream"
                }`}
              >
                <span className={`shrink-0 transition-colors ${isActive ? "text-copper" : "text-sand/50 group-hover:text-sand"}`}>
                  {item.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-none">{item.label}</p>
                  <p className="mt-1 text-xs text-sand/50">{item.description}</p>
                </div>
                {isActive && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-copper" />}
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="my-5 h-px bg-white/[0.06]" />

        {/* User card */}
        <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4">
          <p className="mb-3 text-[0.65rem] uppercase tracking-[0.28em] text-sand/40">Signed in as</p>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-copper/20 text-xs font-semibold text-copper">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-cream">{user.name}</p>
              <p className="truncate text-xs text-sand/55">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-auto flex flex-col gap-2.5 pt-5">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 rounded-full border border-white/10 px-5 py-2.5 text-xs uppercase tracking-[0.22em] text-sand transition hover:border-copper/40 hover:text-white"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            View Website
          </Link>
          <AdminLogoutButton />
        </div>
      </aside>

      {/* ── Mobile Top Bar ── */}
      <div className="lg:hidden">
        <div className="mb-4 flex items-center justify-between rounded-[1.4rem] border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur-xl">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-[0.6rem] bg-copper/20">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#d4995f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
              </svg>
            </div>
            <span className="text-sm font-semibold tracking-[-0.03em] text-cream">Faste Admin</span>
          </div>

          {/* Mobile Nav Pills */}
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 sm:flex">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-full border px-3 py-1.5 text-[0.65rem] uppercase tracking-[0.2em] transition ${
                      isActive
                        ? "border-copper/40 bg-[rgba(212,153,95,0.12)] text-copper"
                        : "border-white/10 bg-white/[0.03] text-sand hover:text-white"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Hamburger for very small screens */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="flex h-8 w-8 items-center justify-center rounded-[0.6rem] border border-white/10 bg-white/[0.04] text-sand transition hover:text-cream sm:hidden"
              aria-label="Open menu"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Drawer Overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <button
              type="button"
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            />

            {/* Drawer */}
            <div className="relative ml-auto flex h-full w-[280px] flex-col bg-[#160d09] shadow-[−20px_0_60px_rgba(0,0,0,0.5)]">
              <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
                <span className="text-sm font-semibold text-cream">Faste Admin</span>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-sand hover:text-cream"
                  aria-label="Close menu"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-5">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3.5 rounded-[1.2rem] border px-4 py-3.5 transition-all ${
                        isActive
                          ? "border-copper/35 bg-[rgba(212,153,95,0.12)] text-copper"
                          : "border-transparent text-sand/70 hover:border-white/10 hover:bg-white/[0.04] hover:text-cream"
                      }`}
                    >
                      <span className={isActive ? "text-copper" : "text-sand/50"}>{item.icon}</span>
                      <div>
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="mt-0.5 text-xs text-sand/50">{item.description}</p>
                      </div>
                    </Link>
                  );
                })}
              </nav>

              <div className="border-t border-white/[0.06] p-4">
                <div className="mb-3 flex items-center gap-3 rounded-[1.2rem] border border-white/10 bg-white/[0.03] p-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-copper/20 text-xs font-semibold text-copper">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-cream">{user.name}</p>
                    <p className="truncate text-xs text-sand/55">{user.email}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Link
                    href="/"
                    className="rounded-full border border-white/10 px-4 py-2.5 text-center text-xs uppercase tracking-[0.2em] text-sand hover:text-white"
                  >
                    View Website
                  </Link>
                  <AdminLogoutButton />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
