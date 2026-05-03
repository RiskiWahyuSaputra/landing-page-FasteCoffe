"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  removeSavedOrder,
  setCurrentOrderId,
  shouldHideOrderFromCheckout,
  syncSavedOrderStatus,
  upsertSavedOrder,
  type SavedOrder,
} from "@/lib/active-order-storage";
import type { CartItem } from "@/components/CartProvider";
import { useCart } from "@/components/CartProvider";
import { useLocale } from "@/components/LocaleProvider";
import OrderProgress from "@/components/orders/OrderProgress";
import { formatRupiah } from "@/lib/currency";
import { getReverbEcho } from "@/lib/reverb-client";
import { getOrderStatusLabel, type OrderStatus } from "@/lib/order-status";

type CheckoutContentProps = {
  restoredOrder?: SavedOrder | null;
  onOrderViewed?: () => void;
};

function lineTotal(item: CartItem) {
  return item.numericPrice * item.quantity;
}

export default function CheckoutContent({
  restoredOrder,
  onOrderViewed,
}: CheckoutContentProps) {
  const router = useRouter();
  const {
    items,
    subtotal,
    increaseItem,
    decreaseItem,
    removeItem,
    clearCart,
    itemCount,
  } = useCart();
  const { t } = useLocale();

  const paymentMethods = [
    {
      id: "qris",
      label: t("qris"),
      description: t("qris_desc"),
    },
    {
      id: "bank_transfer",
      label: t("bank_transfer"),
      description: t("bank_transfer_desc"),
    },
    {
      id: "cash_on_pickup",
      label: t("cash"),
      description: t("cash_desc"),
    },
    {
      id: "e_wallet",
      label: t("e_wallet"),
      description: t("e_wallet_desc"),
    },
  ] as const;

  type PaymentMethod = (typeof paymentMethods)[number]["id"];
  const MAX_PAYMENT_PROOF_SIZE_BYTES = 4 * 1024 * 1024;
  const allowedPaymentProofMimeTypes = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
  ]);

  function getPaymentMethodLabel(value: PaymentMethod | "") {
    return paymentMethods.find((method) => method.id === value)?.label ?? "-";
  }

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [pickupNote, setPickupNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState("");
  const [showQrisModal, setShowQrisModal] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [submittedOrderId, setSubmittedOrderId] = useState<number | null>(null);
  const [submittedOrderStatus, setSubmittedOrderStatus] =
    useState<OrderStatus>("received");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State untuk menampilkan pesanan yang di-restore dari localStorage
  const [showRestoredOrder, setShowRestoredOrder] = useState(false);
  const [restoredDisplayOrder, setRestoredDisplayOrder] =
    useState<SavedOrder | null>(null);

  const redirectToThankYou = (order?: {
    id?: number | null;
    order_number?: string | null;
  }) => {
    if (typeof order?.id === "number") {
      removeSavedOrder(order.id);
    }

    setSubmittedOrderId(null);
    setOrderNumber("");
    setSuccess("");
    setRestoredDisplayOrder(null);
    setShowRestoredOrder(false);
    onOrderViewed?.();

    const params = new URLSearchParams();
    if (order?.order_number) {
      params.set("order", order.order_number);
    }

    router.replace(
      params.size ? `/thank-you?${params.toString()}` : "/thank-you",
    );
  };

  useEffect(() => {
    if (restoredOrder && shouldHideOrderFromCheckout(restoredOrder.status)) {
      redirectToThankYou(restoredOrder);
      return;
    }

    if (restoredOrder && !shouldHideOrderFromCheckout(restoredOrder.status)) {
      setRestoredDisplayOrder(restoredOrder);
      setShowRestoredOrder(true);
      return;
    }

    setRestoredDisplayOrder(null);
    setShowRestoredOrder(false);
  }, [restoredOrder]);

  // Polling untuk update status pesanan yang di-restore
  useEffect(() => {
    if (!restoredDisplayOrder || items.length > 0) return;

    const fetchOrderStatus = async () => {
      try {
        const res = await fetch(`/api/orders?id=${restoredDisplayOrder.id}`);
        if (res.ok) {
          const data = (await res.json()) as { status?: OrderStatus };
          if (data.status && data.status !== restoredDisplayOrder.status) {
            if (shouldHideOrderFromCheckout(data.status)) {
              redirectToThankYou(restoredDisplayOrder);
              return;
            }

            setRestoredDisplayOrder((prev) =>
              prev ? { ...prev, status: data.status! } : null,
            );
            syncSavedOrderStatus(restoredDisplayOrder.id, data.status);
          }
        }
      } catch {
        // Silent fail
      }
    };

    // Poll every 10 seconds
    const interval = setInterval(fetchOrderStatus, 10000);
    return () => clearInterval(interval);
  }, [restoredDisplayOrder, items.length]);

  const handleDismissRestoredOrder = () => {
    setShowRestoredOrder(false);
    setRestoredDisplayOrder(null);
    onOrderViewed?.();
  };

  const serviceFee = items.length ? 5000 : 0;
  const total = subtotal + serviceFee;
  const requiresPaymentProof =
    paymentMethod !== "" && paymentMethod !== "cash_on_pickup";

  const handlePlaceOrder = async () => {
    setError("");
    setSuccess("");

    if (!customerName.trim() || !customerPhone.trim()) {
      setError(t("error_name_phone"));
      return;
    }

    if (!items.length) {
      setError(t("error_empty_cart"));
      return;
    }

    if (!paymentMethod) {
      setError(t("error_payment_method"));
      return;
    }

    if (requiresPaymentProof && !paymentProofFile) {
      setError(t("error_payment_proof"));
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("customer_name", customerName.trim());
      formData.append("customer_phone", customerPhone.trim());
      formData.append("pickup_note", pickupNote.trim());
      formData.append("payment_method", paymentMethod);
      formData.append("service_fee", String(serviceFee));

      if (paymentProofFile) {
        formData.append("payment_proof", paymentProofFile);
      }

      items.forEach((item, index) => {
        formData.append(`items[${index}][name]`, item.name);
        formData.append(`items[${index}][description]`, item.description);
        formData.append(`items[${index}][quantity]`, String(item.quantity));
        formData.append(
          `items[${index}][numeric_price]`,
          String(item.numericPrice),
        );

        if (item.imageUrl) {
          formData.append(`items[${index}][image_url]`, item.imageUrl);
        }
      });

      const response = await fetch("/api/orders", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json().catch(() => null)) as {
        message?: string;
        order?: { id?: number; order_number?: string; status?: OrderStatus };
      } | null;

      if (!response.ok) {
        setError(payload?.message ?? t("error_generic"));
        return;
      }

      const newOrderId = payload?.order?.id ?? null;
      const newOrderNumber = payload?.order?.order_number ?? "";
      const newOrderStatus = payload?.order?.status ?? "received";

      // Simpan ke localStorage agar bisa diakses setelah refresh
      if (newOrderId && newOrderNumber) {
        const newOrder: SavedOrder = {
          id: newOrderId,
          order_number: newOrderNumber,
          status: newOrderStatus,
        };
        upsertSavedOrder(newOrder);
        setCurrentOrderId(newOrderId);
      }

      setSuccess(payload?.message ?? t("pesanan_berhasil"));
      setSubmittedOrderId(newOrderId);
      setOrderNumber(newOrderNumber);
      setSubmittedOrderStatus(newOrderStatus);
      setCustomerName("");
      setCustomerPhone("");
      setPickupNote("");
      setPaymentMethod("");
      setPaymentProofFile(null);
      setPaymentProofPreview("");
      setShowQrisModal(false);
      clearCart();
    } catch {
      setError(t("error_backend"));
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!submittedOrderId) {
      return;
    }

    const echo = getReverbEcho();

    if (!echo) {
      return;
    }

    const channelName = `orders.${submittedOrderId}`;
    const channel = echo.channel(channelName);

    channel.listen(
      ".order.status.updated",
      (event: { order?: { status?: OrderStatus } }) => {
        if (event.order?.status) {
          setSubmittedOrderStatus(event.order.status);
        }
      },
    );

    return () => {
      echo.leaveChannel(channelName);
    };
  }, [submittedOrderId]);

  useEffect(() => {
    if (!submittedOrderId) {
      return;
    }

    if (shouldHideOrderFromCheckout(submittedOrderStatus)) {
      redirectToThankYou({
        id: submittedOrderId,
        order_number: orderNumber,
      });
      return;
    }

    syncSavedOrderStatus(submittedOrderId, submittedOrderStatus);
    setCurrentOrderId(submittedOrderId);
  }, [submittedOrderId, submittedOrderStatus]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-page px-6 py-24 md:px-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(127,150,97,0.2),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(91,63,42,0.28),transparent_34%),linear-gradient(180deg,#18130f_0%,#100c09_100%)]" />

      {showQrisModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4 backdrop-blur-sm">
          <button
            type="button"
            aria-label="Tutup QRIS"
            className="absolute inset-0"
            onClick={() => setShowQrisModal(false)}
          />
          <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-copper/25 bg-[#1a100c] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.45)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-sand/55">
                  {t("qris_payment")}
                </p>
                <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-cream">
                  {t("scan_to_pay")}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowQrisModal(false)}
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

            <div className="mt-6 rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,#f8f2e8_0%,#e8dbc7_100%)] p-5 text-ink">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-[#7f6148]">
                    Faste Coffee
                  </p>
                  <p className="mt-1 text-lg font-semibold">{t("qris_payment")}</p>
                </div>
                <div className="rounded-full border border-[#d3c2b4] px-3 py-1 text-[0.65rem] uppercase tracking-[0.2em] text-[#7f6148]">
                  Amount
                </div>
              </div>

              <div className="mt-5 flex justify-center">
                <div className="rounded-[1.4rem] bg-white p-4 shadow-[0_14px_30px_rgba(58,37,24,0.12)]">
                  <svg
                    width="220"
                    height="220"
                    viewBox="0 0 220 220"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-[220px] w-[220px]"
                  >
                    <rect width="220" height="220" rx="18" fill="white" />
                    <rect x="16" y="16" width="48" height="48" fill="#111111" />
                    <rect x="24" y="24" width="32" height="32" fill="white" />
                    <rect x="32" y="32" width="16" height="16" fill="#111111" />
                    <rect
                      x="156"
                      y="16"
                      width="48"
                      height="48"
                      fill="#111111"
                    />
                    <rect x="164" y="24" width="32" height="32" fill="white" />
                    <rect
                      x="172"
                      y="32"
                      width="16"
                      height="16"
                      fill="#111111"
                    />
                    <rect
                      x="16"
                      y="156"
                      width="48"
                      height="48"
                      fill="#111111"
                    />
                    <rect x="24" y="164" width="32" height="32" fill="white" />
                    <rect
                      x="32"
                      y="172"
                      width="16"
                      height="16"
                      fill="#111111"
                    />
                    <rect x="84" y="20" width="12" height="12" fill="#111111" />
                    <rect
                      x="108"
                      y="20"
                      width="12"
                      height="12"
                      fill="#111111"
                    />
                    <rect
                      x="120"
                      y="32"
                      width="12"
                      height="12"
                      fill="#111111"
                    />
                    <rect x="84" y="44" width="12" height="12" fill="#111111" />
                    <rect x="96" y="56" width="12" height="12" fill="#111111" />
                    <rect
                      x="120"
                      y="56"
                      width="12"
                      height="12"
                      fill="#111111"
                    />
                    <rect x="72" y="84" width="12" height="12" fill="#111111" />
                    <rect x="96" y="84" width="12" height="12" fill="#111111" />
                    <rect
                      x="120"
                      y="84"
                      width="12"
                      height="12"
                      fill="#111111"
                    />
                    <rect
                      x="144"
                      y="84"
                      width="12"
                      height="12"
                      fill="#111111"
                    />
                    <rect x="84" y="96" width="12" height="12" fill="#111111" />
                    <rect
                      x="108"
                      y="96"
                      width="12"
                      height="12"
                      fill="#111111"
                    />
                    <rect
                      x="132"
                      y="96"
                      width="12"
                      height="12"
                      fill="#111111"
                    />
                    <rect
                      x="156"
                      y="96"
                      width="12"
                      height="12"
                      fill="#111111"
                    />
                    <rect
                      x="72"
                      y="108"
                      width="12"
                      height="12"
                      fill="#111111"
                    />
                    <rect
                      x="96"
                      y="108"
                      width="12"
                      height="12"
                      fill="#111111"
                    />
                    <rect
                      x="120"
                      y="108"
                      width="12"
                      height="12"
                      fill="#111111"
                    />
                    <rect
                      x="144"
                      y="108"
                      width="12"
                      height="12"
                      fill="#111111"
                    />
                    <rect
                      x="84"
                      y="120"
                      width="12"
                      height="12"
                      fill="#111111"
                    />
                    <rect
                      x="108"
                      y="120"
                      width="12"
                      height="12"
                      fill="#111111"
                    />
                    <rect
                      x="132"
                      y="120"
                      width="12"
                      height="12"
                      fill="#111111"
                    />
                    <rect
                      x="72"
                      y="132"
                      width="12"
                      height="12"
                      fill="#111111"
                    />
                    <rect
                      x="96"
                      y="132"
                      width="12"
                      height="12"
                      fill="#111111"
                    />
                    <rect
                      x="120"
                      y="132"
                      width="12"
                      height="12"
                      fill="#111111"
                    />
                    <rect
                      x="168"
                      y="132"
                      width="12"
                      height="12"
                      fill="#111111"
                    />
                    <rect
                      x="84"
                      y="144"
                      width="12"
                      height="12"
                      fill="#111111"
                    />
                    <rect
                      x="132"
                      y="144"
                      width="12"
                      height="12"
                      fill="#111111"
                    />
                    <rect
                      x="156"
                      y="144"
                      width="12"
                      height="12"
                      fill="#111111"
                    />
                    <rect
                      x="72"
                      y="156"
                      width="12"
                      height="12"
                      fill="#111111"
                    />
                    <rect
                      x="96"
                      y="156"
                      width="12"
                      height="12"
                      fill="#111111"
                    />
                    <rect
                      x="120"
                      y="156"
                      width="12"
                      height="12"
                      fill="#111111"
                    />
                    <rect
                      x="144"
                      y="156"
                      width="12"
                      height="12"
                      fill="#111111"
                    />
                    <rect
                      x="84"
                      y="168"
                      width="12"
                      height="12"
                      fill="#111111"
                    />
                    <rect
                      x="108"
                      y="168"
                      width="12"
                      height="12"
                      fill="#111111"
                    />
                    <rect
                      x="132"
                      y="168"
                      width="12"
                      height="12"
                      fill="#111111"
                    />
                    <rect
                      x="156"
                      y="168"
                      width="12"
                      height="12"
                      fill="#111111"
                    />
                    <rect
                      x="84"
                      y="180"
                      width="12"
                      height="12"
                      fill="#111111"
                    />
                    <rect
                      x="120"
                      y="180"
                      width="12"
                      height="12"
                      fill="#111111"
                    />
                    <rect
                      x="144"
                      y="180"
                      width="12"
                      height="12"
                      fill="#111111"
                    />
                    <rect
                      x="168"
                      y="180"
                      width="12"
                      height="12"
                      fill="#111111"
                    />
                  </svg>
                </div>
              </div>

              <div className="mt-5 flex items-end justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-[#7f6148]">
                    {t("total_payment")}
                  </p>
                  <p className="mt-1 text-2xl font-semibold">
                    {formatRupiah(total)}
                  </p>
                </div>
                <div className="rounded-[1rem] border border-[#d3c2b4] px-3 py-2 text-right">
                  <p className="text-[0.65rem] uppercase tracking-[0.18em] text-[#7f6148]">
                    {t("status_saat_ini")}
                  </p>
                  <p className="mt-1 text-sm font-medium">{t("waiting_scan")}</p>
                </div>
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-sand/70">
              {t("qris_simulation")}
            </p>

            <button
              type="button"
              onClick={() => setShowQrisModal(false)}
              className="mt-6 w-full rounded-full border border-copper/40 bg-copper px-5 py-3 text-sm font-medium uppercase tracking-[0.22em] text-ink transition hover:brightness-110"
            >
              {t("close")}
            </button>
          </div>
        </div>
      ) : null}

      <div className="page-shell relative">
        <header className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="section-label">{t("checkout")}</p>
            <h1 className="text-balance text-[clamp(2.8rem,7vw,5.6rem)] font-semibold leading-[0.92] tracking-[-0.06em] text-cream">
              {t("finalize_order")}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-sand/72">
              {t("review_drinks")}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/#menu"
              className="rounded-full border border-white/10 px-5 py-3 text-xs uppercase tracking-[0.24em] text-sand transition hover:border-copper/50 hover:text-white"
            >
              {t("back_to_menu")}
            </Link>
            <Link
              href="/"
              className="rounded-full border border-copper/30 bg-copper/12 px-5 py-3 text-xs uppercase tracking-[0.24em] text-copper transition hover:border-copper/60 hover:bg-copper hover:text-ink"
            >
              {t("home")}
            </Link>
          </div>
        </header>

        {success && !items.length ? (
          <section className="glass-panel mx-auto max-w-3xl rounded-[2rem] border border-white/10 p-8 text-center md:p-10">
            <p className="text-xs uppercase tracking-[0.32em] text-sand/60">
              {t("order_created")}
            </p>
            <h2 className="mt-4 text-[clamp(2rem,5vw,3.6rem)] font-semibold tracking-[-0.05em] text-cream">
              {t("pesanan_berhasil")}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-sand/72">
              {success}
              {orderNumber ? ` ${t("nomor_order")}: ${orderNumber}.` : ""}
            </p>
            <div className="mt-8 text-left">
              <div className="mb-4 rounded-[1.4rem] border border-copper/25 bg-copper/10 px-5 py-4">
                <p className="text-xs uppercase tracking-[0.24em] text-sand/58">
                  {t("status_saat_ini")}
                </p>
                <p className="mt-2 text-lg font-semibold text-copper">
                  {getOrderStatusLabel(submittedOrderStatus, t)}
                </p>
              </div>
              <OrderProgress status={submittedOrderStatus} />
            </div>
            <Link
              href="/#menu"
              className="mt-8 inline-flex rounded-full border border-copper/40 bg-copper px-6 py-3 text-sm font-medium uppercase tracking-[0.22em] text-ink transition hover:brightness-110"
            >
              {t("pesan_lagi")}
            </Link>
          </section>
        ) : showRestoredOrder && !items.length && restoredDisplayOrder ? (
          /* Tampilkan pesanan yang di-restore (dari localStorage) */
          <section className="glass-panel mx-auto max-w-3xl rounded-[2rem] border border-white/10 p-8 text-center md:p-10">
            <p className="text-xs uppercase tracking-[0.32em] text-sand/60">
              {t("my_order")}
            </p>
            <h2 className="mt-4 text-[clamp(2rem,5vw,3.6rem)] font-semibold tracking-[-0.05em] text-cream">
              {t("view_past_order")}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-sand/72">
              {t("have_previous_order")}{" "}
              <span className="font-mono text-copper">
                {restoredDisplayOrder.order_number}
              </span>
            </p>
            <div className="mt-8 text-left">
              <div className="mb-4 rounded-[1.4rem] border border-copper/25 bg-copper/10 px-5 py-4">
                <p className="text-xs uppercase tracking-[0.24em] text-sand/58">
                  {t("status_saat_ini")}
                </p>
                <p className="mt-2 text-lg font-semibold text-copper">
                  {getOrderStatusLabel(restoredDisplayOrder.status, t)}
                </p>
              </div>
              <OrderProgress status={restoredDisplayOrder.status} />
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={handleDismissRestoredOrder}
                className="mt-4 inline-flex rounded-full border border-white/10 px-5 py-3 text-sm font-medium uppercase tracking-[0.22em] text-sand transition hover:border-copper/30 hover:text-white"
              >
                {t("buat_pesanan_baru")}
              </button>
              <Link
                href="/#menu"
                className="mt-4 inline-flex rounded-full border border-copper/40 bg-copper px-6 py-3 text-sm font-medium uppercase tracking-[0.22em] text-ink transition hover:brightness-110"
              >
                {t("pesan_lagi")}
              </Link>
            </div>
          </section>
        ) : !items.length ? (
          <section className="glass-panel mx-auto max-w-3xl rounded-[2rem] border border-white/10 p-8 text-center md:p-10">
            <p className="text-xs uppercase tracking-[0.32em] text-sand/60">
              {t("empty_cart")}
            </p>
            <h2 className="mt-4 text-[clamp(2rem,5vw,3.6rem)] font-semibold tracking-[-0.05em] text-cream">
              {t("ready_no_order")}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-sand/72">
              {t("add_first")}
            </p>
            <Link
              href="/#menu"
              className="mt-8 inline-flex rounded-full border border-copper/40 bg-copper px-6 py-3 text-sm font-medium uppercase tracking-[0.22em] text-ink transition hover:brightness-110"
            >
              {t("explore_menu")}
            </Link>
          </section>
        ) : (
          <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-5">
              <article className="glass-panel rounded-[2rem] border border-white/10 p-6 md:p-7">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-sand/60">
                      {t("order_items")}
                    </p>
                    <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-cream">
                      {String(itemCount).padStart(2, "0")} {t("cups_in_order")}
                    </h2>
                  </div>
                  <p className="max-w-sm text-sm leading-6 text-sand/70">
                    {t("adjust_quantity")}
                  </p>
                </div>

                <div className="mt-8 space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.name}
                      className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-4"
                    >
                      <div className="flex gap-4">
                        <div
                          className={`h-24 w-20 shrink-0 rounded-[1.2rem] bg-gradient-to-br ${item.accent}`}
                        >
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="h-full w-full rounded-[1.2rem] object-cover"
                            />
                          ) : null}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <h3 className="text-xl font-semibold text-cream">
                                {item.name}
                              </h3>
                              <p className="mt-2 max-w-md text-sm leading-6 text-sand/70">
                                {item.description}
                              </p>
                            </div>

                            <div className="text-left sm:text-right">
                              <p className="text-xs uppercase tracking-[0.22em] text-sand/58">
                                {t("line_total")}
                              </p>
                              <p className="mt-2 text-lg font-semibold text-copper">
                                {formatRupiah(lineTotal(item))}
                              </p>
                            </div>
                          </div>

                          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-2 rounded-full border border-copper/30 bg-copper/12 p-1">
                              <button
                                type="button"
                                onClick={() => decreaseItem(item.name)}
                                className="flex h-9 w-9 items-center justify-center rounded-full text-lg text-copper transition hover:bg-copper hover:text-ink"
                              >
                                -
                              </button>
                              <span className="min-w-8 text-center text-sm font-medium text-cream">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => increaseItem(item.name)}
                                className="flex h-9 w-9 items-center justify-center rounded-full text-lg text-copper transition hover:bg-copper hover:text-ink"
                              >
                                +
                              </button>
                            </div>

                            <div className="flex items-center gap-4">
                              <p className="text-sm text-sand/70">
                                {item.price} {t("per_cup")}
                              </p>
                              <button
                                type="button"
                                onClick={() => removeItem(item.name)}
                                className="text-xs uppercase tracking-[0.24em] text-sand/64 transition hover:text-white"
                              >
                                {t("remove")}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            </div>

            <div className="space-y-5">
              <article className="glass-panel rounded-[2rem] border border-white/10 p-6 md:p-7">
                <p className="text-xs uppercase tracking-[0.28em] text-sand/60">
                  {t("customer_details")}
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-cream">
                  {t("checkout_form")}
                </h2>

                <div className="mt-7 space-y-4">
                  <label className="block">
                    <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-sand/62">
                      {t("full_name")}
                    </span>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(event) => setCustomerName(event.target.value)}
                      placeholder={t("name_placeholder")}
                      className="w-full rounded-[1.2rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-cream outline-none transition placeholder:text-sand/35 focus:border-copper/50 focus:bg-white/[0.06]"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-sand/62">
                      {t("phone_number")}
                    </span>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(event) => setCustomerPhone(event.target.value)}
                      placeholder={t("phone_placeholder")}
                      className="w-full rounded-[1.2rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-cream outline-none transition placeholder:text-sand/35 focus:border-copper/50 focus:bg-white/[0.06]"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-sand/62">
                      {t("pickup_note")}
                    </span>
                    <textarea
                      rows={4}
                      value={pickupNote}
                      onChange={(event) => setPickupNote(event.target.value)}
                      placeholder={t("pickup_placeholder")}
                      className="w-full rounded-[1.2rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-cream outline-none transition placeholder:text-sand/35 focus:border-copper/50 focus:bg-white/[0.06]"
                    />
                  </label>

                  <div>
                    <span className="mb-3 block text-xs uppercase tracking-[0.24em] text-sand/62">
                      {t("payment_method")}
                    </span>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {paymentMethods.map((method) => {
                        const isSelected = paymentMethod === method.id;
                        return (
                          <button
                            key={method.id}
                            type="button"
                            onClick={() => {
                              setPaymentMethod(method.id);
                              setError("");

                              if (method.id === "qris") {
                                setShowQrisModal(true);
                              } else {
                                setShowQrisModal(false);
                              }
                            }}
                            className={`rounded-[1.3rem] border px-4 py-4 text-left transition ${
                              isSelected
                                ? "border-copper/40 bg-copper/12"
                                : "border-white/10 bg-white/[0.03] hover:border-copper/25 hover:bg-white/[0.05]"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p
                                  className={`text-sm font-semibold ${isSelected ? "text-copper" : "text-cream"}`}
                                >
                                  {method.label}
                                </p>
                                <p className="mt-1 text-xs leading-5 text-sand/62">
                                  {method.description}
                                </p>
                              </div>
                              <span
                                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                                  isSelected
                                    ? "border-copper bg-copper text-ink"
                                    : "border-white/15 text-transparent"
                                }`}
                              >
                                <svg
                                  width="11"
                                  height="11"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="3"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {paymentMethod === "qris" ? (
                      <div className="mt-4 rounded-[1.2rem] border border-copper/25 bg-copper/10 px-4 py-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-cream">
                              QRIS dipilih
                            </p>
                            <p className="mt-1 text-sm leading-6 text-sand/68">
                              Popup QR akan muncul untuk proses scan pembayaran.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowQrisModal(true)}
                            className="rounded-full border border-copper/35 px-4 py-2 text-xs uppercase tracking-[0.2em] text-copper transition hover:bg-copper hover:text-ink"
                          >
                            Buka QRIS
                          </button>
                        </div>
                      </div>
                    ) : null}

                    {paymentMethod === "bank_transfer" ? (
                      <div className="mt-4 rounded-[1.2rem] border border-white/10 bg-white/[0.03] px-4 py-4">
                        <p className="text-sm font-semibold text-cream">
                          Transfer ke rekening admin
                        </p>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          <div className="rounded-[1rem] border border-white/10 bg-white/[0.02] px-3 py-3">
                            <p className="text-xs uppercase tracking-[0.18em] text-sand/50">
                              BCA
                            </p>
                            <p className="mt-1 text-sm font-medium text-cream">
                              1234567890
                            </p>
                            <p className="mt-1 text-xs text-sand/58">
                              a.n. Faste Coffee
                            </p>
                          </div>
                          <div className="rounded-[1rem] border border-white/10 bg-white/[0.02] px-3 py-3">
                            <p className="text-xs uppercase tracking-[0.18em] text-sand/50">
                              Mandiri
                            </p>
                            <p className="mt-1 text-sm font-medium text-cream">
                              9876543210
                            </p>
                            <p className="mt-1 text-xs text-sand/58">
                              a.n. Faste Coffee
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {paymentMethod === "cash_on_pickup" ? (
                      <div className="mt-4 rounded-[1.2rem] border border-white/10 bg-white/[0.03] px-4 py-4 text-sm leading-6 text-sand/68">
                        Pembayaran dilakukan saat pesanan diambil di Kasir.
                      </div>
                    ) : null}

                    {paymentMethod === "e_wallet" ? (
                      <div className="mt-4 rounded-[1.2rem] border border-white/10 bg-white/[0.03] px-4 py-4 text-sm leading-6 text-sand/68">
                        Siapkan konfirmasi pembayaran dari e-wallet pilihanmu
                        sebelum mengambil pesanan.
                      </div>
                    ) : null}

                    <label className="mt-4 block">
                      <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-sand/62">
                        {t("payment_proof_label")}
                      </span>
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                        onChange={(event) => {
                          const file = event.target.files?.[0] ?? null;
                          setError("");

                          if (!file) {
                            setPaymentProofFile(null);
                            setPaymentProofPreview("");
                            return;
                          }

                          if (!allowedPaymentProofMimeTypes.has(file.type)) {
                            setPaymentProofFile(null);
                            setPaymentProofPreview("");
                            setError(
                              "Format bukti pembayaran harus JPG, PNG, atau WEBP.",
                            );
                            event.currentTarget.value = "";
                            return;
                          }

                          if (file.size > MAX_PAYMENT_PROOF_SIZE_BYTES) {
                            setPaymentProofFile(null);
                            setPaymentProofPreview("");
                            setError("Ukuran bukti pembayaran maksimal 4 MB.");
                            event.currentTarget.value = "";
                            return;
                          }

                          setPaymentProofFile(file);
                          setPaymentProofPreview(URL.createObjectURL(file));
                        }}
                        className="w-full rounded-[1.2rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-cream outline-none file:mr-4 file:rounded-full file:border-0 file:bg-copper file:px-4 file:py-2 file:text-xs file:font-medium file:uppercase file:tracking-[0.18em] file:text-ink"
                      />
                      <p className="mt-3 text-xs leading-6 text-sand/62">
                        Upload JPG, PNG, atau WEBP. Maksimal 4 MB.
                        {requiresPaymentProof
                          ? " Bukti pembayaran wajib untuk metode non-cash."
                          : " Untuk cash, upload bukti bersifat opsional."}
                      </p>
                    </label>

                    {paymentProofPreview ? (
                      <div className="overflow-hidden rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-3">
                        <img
                          src={paymentProofPreview}
                          alt="Preview bukti pembayaran"
                          className="h-52 w-full rounded-[1rem] object-cover"
                        />
                      </div>
                    ) : null}
                  </div>
                </div>
              </article>

              <article className="glass-panel rounded-[2rem] border border-white/10 p-6 md:p-7">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-sand/60">
                      {t("payment_summary")}
                    </p>
                    <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-cream">
                      {t("order_recap")}
                    </h2>
                  </div>
                  <div className="rounded-full border border-white/10 px-3 py-1 text-[0.68rem] uppercase tracking-[0.24em] text-sand/78">
                    Live
                  </div>
                </div>

                <div className="mt-7 space-y-4">
                  <div className="flex items-center justify-between text-sm text-sand/70">
                    <span>{t("subtotal")}</span>
                    <span>{formatRupiah(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-sand/70">
                    <span>{t("service_fee")}</span>
                    <span>{formatRupiah(serviceFee)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-sand/70">
                    <span>{t("payment_method")}</span>
                    <span>{getPaymentMethodLabel(paymentMethod)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-sand/70">
                    <span>{t("payment_proof")}</span>
                    <span>
                      {paymentProofFile ? paymentProofFile.name : "-"}
                    </span>
                  </div>
                  <div className="h-px bg-white/10" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-[0.24em] text-sand/65">
                      {t("total")}
                    </span>
                    <span className="text-2xl font-semibold tracking-[-0.04em] text-cream">
                      {formatRupiah(total)}
                    </span>
                  </div>
                </div>

                {error ? (
                  <div className="mt-5 rounded-[1.2rem] border border-[#c86b57]/35 bg-[#5a2018]/20 px-4 py-3 text-sm text-[#ffd8d1]">
                    {error}
                  </div>
                ) : null}

                {success ? (
                  <div className="mt-5 rounded-[1.2rem] border border-copper/25 bg-copper/12 px-4 py-3 text-sm text-cream">
                    {success}
                    {orderNumber ? ` Nomor order: ${orderNumber}.` : ""}
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                  className="mt-8 w-full rounded-full border border-copper/40 bg-copper px-6 py-3 text-sm font-medium uppercase tracking-[0.22em] text-ink transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? t("submitting") : t("place_order")}
                </button>

                <p className="mt-4 text-sm leading-6 text-sand/62">
                  {t("checkout_post_info")}
                </p>
              </article>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
