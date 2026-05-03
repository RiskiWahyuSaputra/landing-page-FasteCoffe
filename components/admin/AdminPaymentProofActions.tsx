"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminPaymentProofActions({
  orderId,
  orderNumber,
  proofUrl,
}: {
  orderId: number;
  orderNumber: string;
  proofUrl: string;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setError("");
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/admin/orders/${orderId}/payment-proof`, {
        method: "DELETE",
      });

      const payload = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;

      if (!response.ok) {
        setError(payload?.message ?? "Gagal menghapus bukti pembayaran.");
        return;
      }

      setIsOpen(false);
      startTransition(() => router.refresh());
    } catch {
      setError("Tidak bisa menghubungi endpoint bukti pembayaran.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex rounded-full border border-copper/30 bg-copper/10 px-3.5 py-2 text-[0.68rem] uppercase tracking-[0.18em] text-copper transition hover:border-copper/50 hover:bg-copper hover:text-ink"
        >
          Lihat Bukti
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="inline-flex rounded-full border border-white/10 px-3.5 py-2 text-[0.68rem] uppercase tracking-[0.18em] text-sand transition hover:border-[#c86b57]/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isDeleting ? "Menghapus..." : "Hapus"}
        </button>
      </div>

      {error ? (
        <div className="mt-3 rounded-[1rem] border border-[#c86b57]/35 bg-[#5a2018]/20 px-4 py-3 text-sm text-[#ffd8d1]">
          {error}
        </div>
      ) : null}

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <button
            type="button"
            aria-label="Tutup bukti pembayaran"
            className="absolute inset-0"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative w-full max-w-4xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#1a100c] shadow-[0_30px_90px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-sand/50">
                  Bukti Pembayaran
                </p>
                <h3 className="mt-1 text-lg font-semibold text-cream">
                  {orderNumber}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-sand transition hover:border-copper/40 hover:text-white"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="p-5">
              <div className="overflow-hidden rounded-[1.4rem] border border-white/10 bg-white/[0.03]">
                <img
                  src={proofUrl}
                  alt={`Bukti pembayaran ${orderNumber}`}
                  className="max-h-[75vh] w-full object-contain bg-[#120b08]"
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
