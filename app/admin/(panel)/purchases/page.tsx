import Link from "next/link";

import { formatRupiah } from "@/lib/currency";
import { requireAdminSession } from "@/lib/admin-session";
import { getAdminOrders } from "@/lib/laravel-admin-api";
import type { OrderHistoryFilter } from "@/lib/order-types";

const filters: Array<{ label: string; value: OrderHistoryFilter }> = [
  { label: "Hari Ini", value: "today" },
  { label: "Bulan Lalu", value: "last_month" },
  { label: "Tahun Lalu", value: "last_year" }
];

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }

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
  const selectedFilter = filters.some(
    (item) => item.value === searchParams?.filter
  )
    ? (searchParams?.filter as OrderHistoryFilter)
    : "today";

  const { token } = await requireAdminSession();
  const data = await getAdminOrders(token, selectedFilter);

  return (
    <section className="flex min-h-[calc(100vh-2rem)] flex-col gap-6">
      <header className="glass-panel grain-overlay rounded-[2rem] border border-white/10 px-6 py-6 md:px-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="section-label">Purchase History</p>
            <h1 className="text-[clamp(2.6rem,5vw,4.8rem)] font-semibold leading-[0.92] tracking-[-0.06em] text-cream">
              Track checkout activity with time-based purchase filters.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-sand/70">
              Halaman ini menampilkan riwayat pembelian dari checkout frontend
              dan bisa difilter berdasarkan hari ini, bulan lalu, atau tahun lalu.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] px-4 py-4">
              <p className="text-xs uppercase tracking-[0.24em] text-sand/58">
                Total Orders
              </p>
              <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-cream">
                {data.summary.count}
              </p>
            </div>
            <div className="rounded-[1.4rem] border border-copper/25 bg-[rgba(212,153,95,0.1)] px-4 py-4">
              <p className="text-xs uppercase tracking-[0.24em] text-sand/58">
                Revenue
              </p>
              <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-copper">
                {formatRupiah(data.summary.revenue)}
              </p>
            </div>
          </div>
        </div>
      </header>

      <section className="glass-panel rounded-[2rem] border border-white/10 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-sand/60">
              Filter Range
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-cream">
              Select purchase window
            </h2>
          </div>

          <div className="flex flex-wrap gap-3">
            {filters.map((filter) => {
              const isActive = filter.value === selectedFilter;

              return (
                <Link
                  key={filter.value}
                  href={`/admin/purchases?filter=${filter.value}`}
                  className={`rounded-full border px-5 py-3 text-xs uppercase tracking-[0.24em] transition ${
                    isActive
                      ? "border-copper/40 bg-[rgba(212,153,95,0.12)] text-copper"
                      : "border-white/10 bg-white/[0.03] text-sand hover:border-copper/30 hover:text-white"
                  }`}
                >
                  {filter.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="mt-8 space-y-4">
          {data.orders.length === 0 ? (
            <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-8 text-center">
              <p className="text-lg font-medium text-cream">
                Belum ada pembelian untuk filter ini.
              </p>
              <p className="mt-3 text-sm leading-6 text-sand/70">
                Coba ganti filter waktu atau lakukan checkout dari halaman frontend.
              </p>
            </div>
          ) : (
            data.orders.map((order) => (
              <article
                key={order.id}
                className="rounded-[1.8rem] border border-white/10 bg-white/[0.03] p-5"
              >
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.26em] text-sand/58">
                        Order Number
                      </p>
                      <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-cream">
                        {order.order_number}
                      </h3>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <p className="text-xs uppercase tracking-[0.22em] text-sand/55">
                          Customer
                        </p>
                        <p className="mt-2 text-sm leading-6 text-cream">
                          {order.customer_name}
                        </p>
                        <p className="text-sm leading-6 text-sand/68">
                          {order.customer_phone}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.22em] text-sand/55">
                          Pickup Note
                        </p>
                        <p className="mt-2 text-sm leading-6 text-sand/68">
                          {order.pickup_note || "-"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3 xl:w-[420px]">
                    <div className="rounded-[1.2rem] border border-white/10 bg-black/10 p-4">
                      <p className="text-xs uppercase tracking-[0.22em] text-sand/55">
                        Placed
                      </p>
                      <p className="mt-3 text-sm leading-6 text-cream">
                        {formatDate(order.placed_at)}
                      </p>
                    </div>
                    <div className="rounded-[1.2rem] border border-white/10 bg-black/10 p-4">
                      <p className="text-xs uppercase tracking-[0.22em] text-sand/55">
                        Items
                      </p>
                      <p className="mt-3 text-2xl font-semibold text-cream">
                        {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                      </p>
                    </div>
                    <div className="rounded-[1.2rem] border border-copper/25 bg-[rgba(212,153,95,0.1)] p-4">
                      <p className="text-xs uppercase tracking-[0.22em] text-sand/55">
                        Total
                      </p>
                      <p className="mt-3 text-xl font-semibold text-copper">
                        {formatRupiah(order.total)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-[1.2rem] border border-white/10 bg-black/10 p-4"
                    >
                      <div className="flex gap-4">
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-[1rem] bg-page-elevated">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-base font-medium text-cream">
                            {item.name}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-sand/68">
                            {item.quantity} x {formatRupiah(item.unit_price)}
                          </p>
                          <p className="mt-2 text-sm font-medium text-copper">
                            {formatRupiah(item.line_total)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </section>
  );
}
