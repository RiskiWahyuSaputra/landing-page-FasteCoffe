"use client";

import { useEffect, useState } from "react";
import CheckoutContent from "@/components/checkout/CheckoutContent";
import {
  clearCurrentOrderId,
  getRestorableOrder,
  type SavedOrder,
} from "@/lib/active-order-storage";

export default function CheckoutPage() {
  const [restoredOrder, setRestoredOrder] = useState<SavedOrder | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    setRestoredOrder(getRestorableOrder());
    setIsInitializing(false);
  }, []);

  // Tampilkan loading saat inisialisasi
  if (isInitializing) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-page px-6 py-24 md:px-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(127,150,97,0.2),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(91,63,42,0.28),transparent_34%),linear-gradient(180deg,#18130f_0%,#100c09_100%)]" />
        <div className="page-shell relative flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-copper/20 border-t-copper" />
            <p className="mt-4 text-sm uppercase tracking-[0.2em] text-sand/60">
              Memuat...
            </p>
          </div>
        </div>
      </main>
    );
  }

  // Render CheckoutContent dengan props untuk pesanan yang di-restore
  return (
    <CheckoutContent
      restoredOrder={restoredOrder}
      onOrderViewed={() => {
        // Clear flag untuk mencegah popup berkali-kali
        clearCurrentOrderId();
      }}
    />
  );
}
