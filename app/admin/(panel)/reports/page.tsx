import { redirect } from "next/navigation";

import { requireAdminSession } from "@/lib/admin-session";
import { getAdminOrders } from "@/lib/laravel-admin-api";
import { formatRupiah } from "@/lib/currency";
import type { OrderHistoryEntry, OrderHistoryFilter } from "@/lib/order-types";

const filters: { value: OrderHistoryFilter; label: string }[] = [
  { value: "today", label: "Hari Ini" },
  { value: "yesterday", label: "Kemarin" },
  { value: "last_month", label: "Bulan Lalu" },
  { value: "last_year", label: "Tahun Lalu" },
];

function formatDate(value: string | null) {
  if (!value) return "–";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function FinancialReportsPage({
  searchParams,
}: {
  searchParams: { filter?: string };
}) {
  const { token } = await requireAdminSession();
  const activeFilter = (searchParams.filter as OrderHistoryFilter) || "today";

  // Get data for all filters to show summary
  const [todayData, yesterdayData, lastMonthData, lastYearData, activeData] =
    await Promise.all([
      getAdminOrders(token, "today"),
      getAdminOrders(token, "yesterday"),
      getAdminOrders(token, "last_month"),
      getAdminOrders(token, "last_year"),
      getAdminOrders(token, activeFilter),
    ]);

  const getSummary = (data: { summary: { count: number; revenue: number } }) =>
    data.summary;
  const getAverage = (data: { summary: { count: number; revenue: number } }) =>
    data.summary.count > 0
      ? Math.round(data.summary.revenue / data.summary.count)
      : 0;

  const activeFilterLabel =
    filters.find((f) => f.value === activeFilter)?.label || "Hari Ini";

  return (
    <section className="flex min-h-[calc(100vh-2rem)] flex-col gap-5">
      {/* Page Header */}
      <header className="glass-panel grain-overlay rounded-[1.8rem] border border-white/10 px-4 py-5 sm:px-6 md:px-8">
        <div className="flex flex-col gap-4 sm:gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="section-label">Laporan Keuangan</p>
            <h1 className="text-[clamp(1.5rem,4vw,3.4rem)] font-semibold leading-[1.05] tracking-[-0.05em] text-cream">
              Laporan Keuangan
            </h1>
            <p className="mt-2 text-sm leading-6 text-sand/65">
              Pantau performa keuangan Faste Coffee dari sini.
            </p>
          </div>

          <div className="flex shrink-0 gap-2">
            <a
              href={`/api/admin/reports/export?filter=${activeFilter}`}
              className="flex items-center gap-2 rounded-full bg-copper px-6 py-3 text-sm font-semibold text-white transition hover:bg-copper-600 active:scale-[0.98]"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="vertical-align-bottom 12h8m-8 0V4m0 16l4-4m-4 4l-4-4"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Export CSV (Excel)
            </a>
          </div>
        </div>
      </header>

      {/* Summary Cards - All Periods */}
      <div className="grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-4">
        {/* Today */}
        <article className="glass-panel rounded-[1.5rem] border border-white/10 p-5">
          <p className="text-xs uppercase tracking-[0.28em] text-sand/55">
            Hari Ini
          </p>
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-2xl font-semibold tracking-[-0.05em] text-cream">
                {formatRupiah(getSummary(todayData).revenue)}
              </p>
              <p className="mt-1 text-xs text-sand/50">Total Pendapatan</p>
            </div>
            <div className="flex justify-between">
              <div>
                <p className="text-xl font-semibold text-cream">
                  {getSummary(todayData).count}
                </p>
                <p className="text-xs text-sand/50">Pesanan</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-semibold text-cream">
                  {formatRupiah(getAverage(todayData))}
                </p>
                <p className="text-xs text-sand/50">Rata-rata Nilai</p>
              </div>
            </div>
          </div>
        </article>

        {/* Yesterday */}
        <article className="glass-panel rounded-[1.5rem] border border-white/10 p-5">
          <p className="text-xs uppercase tracking-[0.28em] text-sand/55">
            Kemarin
          </p>
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-2xl font-semibold tracking-[-0.05em] text-cream">
                {formatRupiah(getSummary(yesterdayData).revenue)}
              </p>
              <p className="mt-1 text-xs text-sand/50">Total Pendapatan</p>
            </div>
            <div className="flex justify-between">
              <div>
                <p className="text-xl font-semibold text-cream">
                  {getSummary(yesterdayData).count}
                </p>
                <p className="text-xs text-sand/50">Pesanan</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-semibold text-cream">
                  {formatRupiah(getAverage(yesterdayData))}
                </p>
                <p className="text-xs text-sand/50">Rata-rata Nilai</p>
              </div>
            </div>
          </div>
        </article>

        {/* Last Month */}
        <article className="glass-panel rounded-[1.5rem] border border-white/10 p-5">
          <p className="text-xs uppercase tracking-[0.28em] text-sand/55">
            Bulan Lalu
          </p>
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-2xl font-semibold tracking-[-0.05em] text-cream">
                {formatRupiah(getSummary(lastMonthData).revenue)}
              </p>
              <p className="mt-1 text-xs text-sand/50">Total Pendapatan</p>
            </div>
            <div className="flex justify-between">
              <div>
                <p className="text-xl font-semibold text-cream">
                  {getSummary(lastMonthData).count}
                </p>
                <p className="text-xs text-sand/50">Pesanan</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-semibold text-cream">
                  {formatRupiah(getAverage(lastMonthData))}
                </p>
                <p className="text-xs text-sand/50">Rata-rata Nilai</p>
              </div>
            </div>
          </div>
        </article>

        {/* Last Year */}
        <article className="glass-panel rounded-[1.5rem] border border-white/10 p-5">
          <p className="text-xs uppercase tracking-[0.28em] text-sand/55">
            Tahun Lalu
          </p>
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-2xl font-semibold tracking-[-0.05em] text-cream">
                {formatRupiah(getSummary(lastYearData).revenue)}
              </p>
              <p className="mt-1 text-xs text-sand/50">Total Pendapatan</p>
            </div>
            <div className="flex justify-between">
              <div>
                <p className="text-xl font-semibold text-cream">
                  {getSummary(lastYearData).count}
                </p>
                <p className="text-xs text-sand/50">Pesanan</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-semibold text-cream">
                  {formatRupiah(getAverage(lastYearData))}
                </p>
                <p className="text-xs text-sand/50">Rata-rata Nilai</p>
              </div>
            </div>
          </div>
        </article>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {filters.map((f) => (
          <a
            key={f.value}
            href={`?filter=${f.value}`}
            className={`shrink-0 rounded-full border border-white/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] transition hover:border-copper/30 hover:text-white ${
              activeFilter === f.value
                ? "bg-copper text-white"
                : "bg-white/[0.04] text-sand"
            }`}
          >
            {f.label}
          </a>
        ))}
      </div>

      {/* Quick View - Dynamic based on filter */}
      <article className="glass-panel rounded-[1.8rem] border border-white/10 overflow-hidden">
        <div className="border-b border-white/10 px-4 py-4 sm:px-6">
          <p className="text-xs uppercase tracking-[0.28em] text-sand/55">
            Riwayat Pesanan
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-cream sm:text-2xl">
            Transaksi {activeFilterLabel}
          </h2>
        </div>

        {activeData.orders.length === 0 ? (
          <div className="py-12 text-center sm:py-16">
            <p className="text-sand/55">Tidak ada pesanan untuk periode ini.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="px-4 py-3 text-xs uppercase tracking-[0.2em] text-sand/50 sm:px-6 sm:py-4">
                    ID Pesanan
                  </th>
                  <th className="px-4 py-3 text-xs uppercase tracking-[0.2em] text-sand/50 sm:px-6 sm:py-4">
                    Pelanggan
                  </th>
                  <th className="px-4 py-3 text-xs uppercase tracking-[0.2em] text-sand/50 sm:px-6 sm:py-4">
                    Item
                  </th>
                  <th className="px-4 py-3 text-xs uppercase tracking-[0.2em] text-sand/50 sm:px-6 sm:py-4">
                    Tanggal
                  </th>
                  <th className="px-4 py-3 text-right text-xs uppercase tracking-[0.2em] text-sand/50 sm:px-6 sm:py-4">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {activeData.orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-white/5 transition hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-3 sm:px-6 sm:py-4">
                      <p className="font-mono text-sm text-copper">
                        {order.order_number}
                      </p>
                    </td>
                    <td className="px-4 py-3 sm:px-6 sm:py-4">
                      <p className="text-sm font-medium text-cream">
                        {order.customer_name}
                      </p>
                      <p className="mt-0.5 text-xs text-sand/50">
                        {order.customer_phone}
                      </p>
                    </td>
                    <td className="px-4 py-3 sm:px-6 sm:py-4">
                      <p className="text-sm text-sand">
                        {order.items.length} item
                      </p>
                    </td>
                    <td className="px-4 py-3 sm:px-6 sm:py-4">
                      <p className="text-sm text-sand">
                        {formatDate(order.placed_at)}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right sm:px-6 sm:py-4">
                      <p className="font-medium text-cream">
                        {formatRupiah(order.total)}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </article>
    </section>
  );
}
