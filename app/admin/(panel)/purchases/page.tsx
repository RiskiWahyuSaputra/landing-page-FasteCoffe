import Link from "next/link";

import { formatRupiah } from "@/lib/currency";
import { requireAdminSession } from "@/lib/admin-session";
import { getAdminOrders } from "@/lib/laravel-admin-api";
import type { OrderHistoryFilter } from "@/lib/order-types";

const filters: Array<{ label: string; value: OrderHistoryFilter; icon: React.ReactNode }> = [
  {
    label: "Hari Ini",
    value: "today",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    )
  },
  {
    label: "Bulan Lalu",
    value: "last_month",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    )
  },
  {
    label: "Tahun Lalu",
    value: "last_year",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    )
  }
];

function formatDate(value: string | null) {
  if (!value) return "–";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export default async function AdminPurchasesPage({
  searchParams
}: {
  searchParams?: { filter?: string };
}) {
  const selectedFilter = filters.some((item) => item.value === searchParams?.filter)
    ? (searchParams?.filter as OrderHistoryFilter)
    : "today";

  const { token } = await requireAdminSession();
  const data = await getAdminOrders(token, selectedFilter);

  return (
    <section className="flex min-h-[calc(100vh-2rem)] flex-col gap-5">
      {/* ── Page Header ── */}
      <header className="glass-panel grain-overlay rounded-[1.8rem] border border-white/10 px-6 py-6 md:px-8">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="section-label">Purchase History</p>
            <h1 className="text-[clamp(1.9rem,4vw,3.2rem)] font-semibold leading-[1.05] tracking-[-0.05em] text-cream">
              Checkout activity
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-sand/65">
              Riwayat pembelian dari checkout frontend. Filter berdasarkan hari ini, bulan lalu, atau tahun lalu.
            </p>
          </div>

          {/* Summary Stats */}
          <div className="flex gap-3">
            <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] px-5 py-3.5 text-center">
              <p className="text-xs uppercase tracking-[0.22em] text-sand/50">Total Orders</p>
              <p className="mt-1.5 text-2xl font-semibold tracking-[-0.04em] text-cream">
                {data.summary.count}
              </p>
            </div>
            <div className="rounded-[1.2rem] border border-copper/25 bg-[rgba(212,153,95,0.08)] px-5 py-3.5 text-center">
              <p className="text-xs uppercase tracking-[0.22em] text-sand/50">Revenue</p>
              <p className="mt-1.5 text-2xl font-semibold tracking-[-0.04em] text-copper">
                {formatRupiah(data.summary.revenue)}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ── Filter + Table ── */}
      <article className="glass-panel rounded-[1.8rem] border border-white/10 p-6">
        {/* Filter Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.26em] text-sand/55">Filter Range</p>
            <h2 className="mt-1.5 text-xl font-semibold tracking-[-0.03em] text-cream">
              Select purchase window
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => {
              const isActive = filter.value === selectedFilter;
              return (
                <Link
                  key={filter.value}
                  href={`/admin/purchases?filter=${filter.value}`}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] transition ${
                    isActive
                      ? "border-copper/40 bg-[rgba(212,153,95,0.12)] text-copper"
                      : "border-white/10 bg-white/[0.03] text-sand hover:border-copper/25 hover:text-white"
                  }`}
                >
                  {filter.icon}
                  {filter.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="my-5 h-px bg-white/[0.06]" />

        {/* Orders List */}
        <div className="space-y-4">
          {data.orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[1.4rem] border border-dashed border-white/10 bg-white/[0.02] py-14 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-[1rem] border border-white/10 bg-white/[0.04] text-sand/40">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
              </div>
              <p className="mt-4 text-base font-medium text-cream">Belum ada pembelian</p>
              <p className="mt-2 max-w-xs text-sm text-sand/55">
                Coba ganti filter waktu atau lakukan checkout dari halaman frontend.
              </p>
            </div>
          ) : (
            data.orders.map((order) => (
              <article
                key={order.id}
                className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.02]"
              >
                {/* Order Header */}
                <div className="flex flex-col gap-4 border-b border-white/[0.06] p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[0.6rem] bg-copper/15 text-copper">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                          <line x1="3" y1="6" x2="21" y2="6" />
                        </svg>
                      </div>
                      <h3 className="text-base font-semibold tracking-[-0.02em] text-cream">
                        {order.order_number}
                      </h3>
                    </div>
                    <div className="hidden h-4 w-px bg-white/[0.1] sm:block" />
                    <p className="text-xs text-sand/55">{formatDate(order.placed_at)}</p>
                  </div>

                  {/* Total Badge */}
                  <div className="flex items-center gap-3">
                    <span className="rounded-full border border-copper/30 bg-[rgba(212,153,95,0.1)] px-3.5 py-1.5 text-sm font-semibold text-copper">
                      {formatRupiah(order.total)}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-sand/60">
                      {order.items.reduce((sum, item) => sum + item.quantity, 0)} item
                    </span>
                  </div>
                </div>

                {/* Customer + Details */}
                <div className="grid gap-0 divide-y divide-white/[0.05] sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                  <div className="p-5">
                    <p className="mb-2 text-xs uppercase tracking-[0.22em] text-sand/45">Customer</p>
                    <p className="text-sm font-medium text-cream">{order.customer_name}</p>
                    <p className="mt-0.5 text-sm text-sand/60">{order.customer_phone}</p>
                  </div>
                  <div className="p-5">
                    <p className="mb-2 text-xs uppercase tracking-[0.22em] text-sand/45">Pickup Note</p>
                    <p className="text-sm text-sand/70">{order.pickup_note || "–"}</p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="border-t border-white/[0.06] p-5">
                  <p className="mb-3 text-xs uppercase tracking-[0.22em] text-sand/45">Items Ordered</p>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 rounded-[1rem] border border-white/[0.07] bg-white/[0.02] p-3"
                      >
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-[0.75rem] bg-white/[0.06]">
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-sand/30">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 8h1a4 4 0 010 8h-1" />
                                <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-cream">{item.name}</p>
                          <p className="mt-0.5 text-xs text-sand/55">
                            {item.quantity}× {formatRupiah(item.unit_price)}
                          </p>
                          <p className="mt-0.5 text-xs font-semibold text-copper">
                            {formatRupiah(item.line_total)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </article>
    </section>
  );
}
