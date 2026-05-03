"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import AdminPaymentProofActions from "@/components/admin/AdminPaymentProofActions";
import AdminOrderStatusManager from "@/components/admin/AdminOrderStatusManager";
import { formatRupiah } from "@/lib/currency";
import { getReverbEcho } from "@/lib/reverb-client";
import type { OrderStatus } from "@/lib/order-status";
import type { OrderHistoryEntry } from "@/lib/order-types";

type AdminOrdersRealtimeProps = {
  initialOrders: OrderHistoryEntry[];
  selectedStatus: OrderStatus;
};

const filters: Array<{
  label: string;
  value: OrderStatus;
  icon: React.ReactNode;
}> = [
  {
    label: "Pesanan Diterima",
    value: "received",
    icon: (
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
      </svg>
    ),
  },
  {
    label: "Pesanan Sedang Dibuat",
    value: "brewing",
    icon: (
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M8 2v2" />
        <path d="M12 2v2" />
        <path d="M16 2v2" />
        <path d="M3 8h13a4 4 0 0 1 4 4v1a7 7 0 0 1-7 7H10a7 7 0 0 1-7-7V8z" />
        <path d="M16 8h1a3 3 0 0 1 0 6h-1" />
      </svg>
    ),
  },
];

function formatDate(value: string | null) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatPaymentMethod(value: string) {
  switch (value) {
    case "qris":
      return "QRIS";
    case "bank_transfer":
      return "Transfer Bank";
    case "cash_on_pickup":
      return "Bayar Saat Ambil";
    case "e_wallet":
      return "Dompet Digital";
    default:
      return value;
  }
}

function sortOrders(orders: OrderHistoryEntry[]) {
  return [...orders].sort((left, right) => {
    const leftTime = left.placed_at ? new Date(left.placed_at).getTime() : 0;
    const rightTime = right.placed_at ? new Date(right.placed_at).getTime() : 0;

    if (leftTime === rightTime) {
      return right.id - left.id;
    }

    return rightTime - leftTime;
  });
}

function upsertOrder(orders: OrderHistoryEntry[], nextOrder: OrderHistoryEntry) {
  return sortOrders([
    nextOrder,
    ...orders.filter((order) => order.id !== nextOrder.id),
  ]);
}

export default function AdminOrdersRealtime({
  initialOrders,
  selectedStatus,
}: AdminOrdersRealtimeProps) {
  const [orders, setOrders] = useState(() => sortOrders(initialOrders));

  useEffect(() => {
    setOrders(sortOrders(initialOrders));
  }, [initialOrders]);

  useEffect(() => {
    const echo = getReverbEcho();
    if (!echo) {
      return;
    }

    const channel = echo.channel("admin.orders");

    channel.listen(
      ".order.created",
      (event: { order?: OrderHistoryEntry }) => {
        if (!event.order) {
          return;
        }

        setOrders((currentOrders) => upsertOrder(currentOrders, event.order!));
      },
    );

    channel.listen(
      ".order.status.updated",
      (event: { order?: OrderHistoryEntry }) => {
        if (!event.order) {
          return;
        }

        setOrders((currentOrders) => upsertOrder(currentOrders, event.order!));
      },
    );

    return () => {
      echo.leaveChannel("admin.orders");
    };
  }, []);

  const filteredOrders = useMemo(
    () => orders.filter((order) => order.status === selectedStatus),
    [orders, selectedStatus],
  );

  return (
    <>
      <header className="glass-panel grain-overlay rounded-[1.8rem] border border-white/10 px-4 py-5 sm:px-6 md:px-8">
        <div className="flex flex-col gap-4 sm:gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="section-label">Pesanan</p>
            <h1 className="text-[clamp(1.5rem,4vw,3.2rem)] font-semibold leading-[1.05] tracking-[-0.05em] text-cream">
              Daftar Pesanan
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-sand/65">
              Pesanan baru akan masuk otomatis tanpa perlu refresh halaman.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] px-4 py-2.5 text-center sm:px-5 sm:py-3.5">
              <p className="text-xs uppercase tracking-[0.22em] text-sand/50">
                Total Pesanan
              </p>
              <p className="mt-1 text-xl font-semibold tracking-[-0.04em] text-cream sm:mt-1.5 sm:text-2xl">
                {filteredOrders.length}
              </p>
            </div>
          </div>
        </div>
      </header>

      <article className="glass-panel rounded-[1.8rem] border border-white/10 p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.26em] text-sand/55">
              Status Pesanan
            </p>
            <h2 className="mt-1.5 text-xl font-semibold tracking-[-0.03em] text-cream">
              Pilih status pesanan
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => {
              const isActive = filter.value === selectedStatus;

              return (
                <Link
                  key={filter.value}
                  href={`/admin/orders?status=${filter.value}`}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] transition ${
                    isActive
                      ? "border-copper/40 bg-copper/12 text-copper"
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

        <div className="my-5 h-px bg-white/[0.06]" />

        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[1.4rem] border border-dashed border-white/10 bg-white/[0.02] py-14 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-[1rem] border border-white/10 bg-white/[0.04] text-sand/40">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              </div>
              <p className="mt-4 text-base font-medium text-cream">
                Belum ada pesanan
              </p>
              <p className="mt-2 max-w-xs text-sm text-sand/55">
                Tidak ada pesanan dengan status ini saat ini.
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <article
                key={order.id}
                className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.02]"
              >
                <div className="flex flex-col gap-4 border-b border-white/[0.06] p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[0.6rem] bg-copper/15 text-copper">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                          <line x1="3" y1="6" x2="21" y2="6" />
                        </svg>
                      </div>
                      <h3 className="text-base font-semibold tracking-[-0.02em] text-cream">
                        {order.order_number}
                      </h3>
                    </div>
                    <div className="hidden h-4 w-px bg-white/[0.1] sm:block" />
                    <p className="text-xs text-sand/55">
                      {formatDate(order.placed_at)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full border border-copper/30 bg-copper/10 px-3.5 py-1.5 text-sm font-semibold text-copper">
                      {formatRupiah(order.total)}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-sand/60">
                      {order.items.reduce(
                        (sum, item) => sum + item.quantity,
                        0,
                      )}{" "}
                      item
                    </span>
                  </div>
                </div>

                <div className="grid gap-0 divide-y divide-white/[0.05] lg:grid-cols-3 lg:divide-x lg:divide-y-0">
                  <div className="p-5">
                    <p className="mb-2 text-xs uppercase tracking-[0.22em] text-sand/45">
                      Pelanggan
                    </p>
                    <p className="text-sm font-medium text-cream">
                      {order.customer_name}
                    </p>
                    <p className="mt-0.5 text-sm text-sand/60">
                      {order.customer_phone}
                    </p>
                  </div>
                  <div className="p-5">
                    <p className="mb-2 text-xs uppercase tracking-[0.22em] text-sand/45">
                      Catatan Pickup
                    </p>
                    <p className="text-sm text-sand/70">
                      {order.pickup_note || "-"}
                    </p>
                  </div>
                  <div className="p-5">
                    <p className="mb-2 text-xs uppercase tracking-[0.22em] text-sand/45">
                      Pembayaran
                    </p>
                    <p className="text-sm font-medium text-cream">
                      {formatPaymentMethod(order.payment_method)}
                    </p>
                    {order.payment_proof_url ? (
                      <AdminPaymentProofActions
                        orderId={order.id}
                        orderNumber={order.order_number}
                        proofUrl={order.payment_proof_url}
                      />
                    ) : (
                      <p className="mt-2 text-xs text-sand/55">
                        Belum ada bukti pembayaran.
                      </p>
                    )}
                  </div>
                </div>

                <div className="border-t border-white/[0.06] px-5 py-5">
                  <AdminOrderStatusManager
                    orderId={order.id}
                    initialStatus={order.status}
                  />
                </div>

                <div className="border-t border-white/[0.06] p-5">
                  <p className="mb-3 text-xs uppercase tracking-[0.22em] text-sand/45">
                    Item Pesanan
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 rounded-[1rem] border border-white/[0.07] bg-white/[0.02] p-3"
                      >
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-[0.75rem] bg-white/[0.06]">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-sand/30">
                              <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                                <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-cream">
                            {item.name}
                          </p>
                          <p className="mt-0.5 text-xs text-sand/55">
                            {item.quantity} x {formatRupiah(item.unit_price)}
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
    </>
  );
}
