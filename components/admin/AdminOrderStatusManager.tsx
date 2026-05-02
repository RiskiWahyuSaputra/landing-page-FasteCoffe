"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";

import OrderProgress from "@/components/orders/OrderProgress";
import {
  ORDER_STATUS_STEPS,
  getOrderStatusDescription,
  getOrderStatusLabel,
  type OrderStatus,
} from "@/lib/order-status";

export default function AdminOrderStatusManager({
  initialStatus,
  orderId,
}: {
  initialStatus: OrderStatus;
  orderId: number;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus>(initialStatus);
  const [error, setError] = useState("");
  const [loadingStatus, setLoadingStatus] = useState<OrderStatus | null>(null);

  const handleUpdate = async (nextStatus: OrderStatus) => {
    if (nextStatus === status) {
      return;
    }

    setError("");
    setLoadingStatus(nextStatus);

    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { message?: string; order?: { status?: OrderStatus } }
        | null;

      if (!response.ok || !payload?.order?.status) {
        setError(payload?.message ?? "Gagal memperbarui status order.");
        return;
      }

      setStatus(payload.order.status);
      startTransition(() => router.refresh());
    } catch {
      setError("Tidak bisa menghubungi endpoint status order.");
    } finally {
      setLoadingStatus(null);
    }
  };

  return (
    <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.025] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-sand/45">
            Order Progress
          </p>
          <h4 className="mt-2 text-lg font-semibold text-cream">
            {getOrderStatusLabel(status)}
          </h4>
          <p className="mt-1 text-sm leading-6 text-sand/65">
            {getOrderStatusDescription(status)}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <OrderProgress status={status} compact />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {ORDER_STATUS_STEPS.map((step) => {
          const isActive = step.value === status;
          const isLoading = loadingStatus === step.value;

          return (
            <button
              key={step.value}
              type="button"
              onClick={() => handleUpdate(step.value)}
              disabled={isLoading}
              className={`rounded-full border px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] transition ${
                isActive
                  ? "border-copper/40 bg-[rgba(212,153,95,0.12)] text-copper"
                  : "border-white/10 bg-white/[0.03] text-sand hover:border-copper/25 hover:text-white"
              } disabled:cursor-not-allowed disabled:opacity-70`}
            >
              {isLoading ? "Updating..." : step.label}
            </button>
          );
        })}
      </div>

      {error ? (
        <div className="mt-4 rounded-[1rem] border border-[#c86b57]/35 bg-[#5a2018]/20 px-4 py-3 text-sm text-[#ffd8d1]">
          {error}
        </div>
      ) : null}
    </div>
  );
}
