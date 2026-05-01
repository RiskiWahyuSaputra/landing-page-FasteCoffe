"use client";

import Link from "next/link";
import { useState } from "react";

import type { CartItem } from "@/components/CartProvider";
import { useCart } from "@/components/CartProvider";
import { formatRupiah } from "@/lib/currency";

function lineTotal(item: CartItem) {
  return item.numericPrice * item.quantity;
}

export default function CheckoutContent() {
  const {
    items,
    subtotal,
    increaseItem,
    decreaseItem,
    removeItem,
    clearCart,
    itemCount
  } = useCart();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [pickupNote, setPickupNote] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const serviceFee = items.length ? 5000 : 0;
  const total = subtotal + serviceFee;

  const handlePlaceOrder = async () => {
    setError("");
    setSuccess("");

    if (!customerName.trim() || !customerPhone.trim()) {
      setError("Nama dan nomor telepon wajib diisi.");
      return;
    }

    if (!items.length) {
      setError("Cart masih kosong.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          customer_name: customerName.trim(),
          customer_phone: customerPhone.trim(),
          pickup_note: pickupNote.trim(),
          service_fee: serviceFee,
          items: items.map((item) => ({
            name: item.name,
            description: item.description,
            quantity: item.quantity,
            numeric_price: item.numericPrice,
            image_url: item.imageUrl ?? null
          }))
        })
      });

      const payload = (await response.json().catch(() => null)) as
        | {
            message?: string;
            order?: { order_number?: string };
          }
        | null;

      if (!response.ok) {
        setError(payload?.message ?? "Gagal membuat pesanan.");
        return;
      }

      setSuccess(payload?.message ?? "Pesanan berhasil dibuat.");
      setOrderNumber(payload?.order?.order_number ?? "");
      setCustomerName("");
      setCustomerPhone("");
      setPickupNote("");
      clearCart();
    } catch {
      setError("Tidak bisa terhubung ke backend checkout.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-page px-6 py-24 md:px-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(212,153,95,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(89,49,28,0.28),transparent_34%),linear-gradient(180deg,#140c08_0%,#0d0806_100%)]" />

      <div className="page-shell relative">
        <header className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="section-label">Checkout</p>
            <h1 className="text-balance text-[clamp(2.8rem,7vw,5.6rem)] font-semibold leading-[0.92] tracking-[-0.06em] text-cream">
              Finalize your order with a cleaner coffee counter flow.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-sand/72">
              Review your drinks, adjust quantities, and confirm the order.
              Riwayat pembelian dari checkout ini juga akan masuk ke admin panel.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/#menu"
              className="rounded-full border border-white/10 px-5 py-3 text-xs uppercase tracking-[0.24em] text-sand transition hover:border-copper/50 hover:text-white"
            >
              Back to Menu
            </Link>
            <Link
              href="/"
              className="rounded-full border border-copper/30 bg-[rgba(212,153,95,0.12)] px-5 py-3 text-xs uppercase tracking-[0.24em] text-copper transition hover:border-copper/60 hover:bg-copper hover:text-[#1a0f09]"
            >
              Home
            </Link>
          </div>
        </header>

        {success && !items.length ? (
          <section className="glass-panel mx-auto max-w-3xl rounded-[2rem] border border-white/10 p-8 text-center md:p-10">
            <p className="text-xs uppercase tracking-[0.32em] text-sand/60">
              Order Created
            </p>
            <h2 className="mt-4 text-[clamp(2rem,5vw,3.6rem)] font-semibold tracking-[-0.05em] text-cream">
              Pesanan berhasil masuk.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-sand/72">
              {success}
              {orderNumber ? ` Nomor order: ${orderNumber}.` : ""}
            </p>
            <Link
              href="/#menu"
              className="mt-8 inline-flex rounded-full border border-copper/40 bg-copper px-6 py-3 text-sm font-medium uppercase tracking-[0.22em] text-[#1a0f09] transition hover:bg-[#e2a86d]"
            >
              Order Again
            </Link>
          </section>
        ) : !items.length ? (
          <section className="glass-panel mx-auto max-w-3xl rounded-[2rem] border border-white/10 p-8 text-center md:p-10">
            <p className="text-xs uppercase tracking-[0.32em] text-sand/60">
              Cart Empty
            </p>
            <h2 className="mt-4 text-[clamp(2rem,5vw,3.6rem)] font-semibold tracking-[-0.05em] text-cream">
              Your checkout page is ready, but there is no order yet.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-sand/72">
              Add a few drinks from the menu first, then return here to see the
              order summary and customer form.
            </p>
            <Link
              href="/#menu"
              className="mt-8 inline-flex rounded-full border border-copper/40 bg-copper px-6 py-3 text-sm font-medium uppercase tracking-[0.22em] text-[#1a0f09] transition hover:bg-[#e2a86d]"
            >
              Explore Menu
            </Link>
          </section>
        ) : (
          <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-5">
              <article className="glass-panel rounded-[2rem] border border-white/10 p-6 md:p-7">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-sand/60">
                      Order Items
                    </p>
                    <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-cream">
                      {String(itemCount).padStart(2, "0")} cups in your order
                    </h2>
                  </div>
                  <p className="max-w-sm text-sm leading-6 text-sand/70">
                    Adjust quantity here before confirming the purchase.
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
                                Line Total
                              </p>
                              <p className="mt-2 text-lg font-semibold text-copper">
                                {formatRupiah(lineTotal(item))}
                              </p>
                            </div>
                          </div>

                          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-2 rounded-full border border-copper/30 bg-[rgba(212,153,95,0.12)] p-1">
                              <button
                                type="button"
                                onClick={() => decreaseItem(item.name)}
                                className="flex h-9 w-9 items-center justify-center rounded-full text-lg text-copper transition hover:bg-copper hover:text-[#1a0f09]"
                              >
                                -
                              </button>
                              <span className="min-w-8 text-center text-sm font-medium text-cream">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => increaseItem(item.name)}
                                className="flex h-9 w-9 items-center justify-center rounded-full text-lg text-copper transition hover:bg-copper hover:text-[#1a0f09]"
                              >
                                +
                              </button>
                            </div>

                            <div className="flex items-center gap-4">
                              <p className="text-sm text-sand/70">
                                {item.price} per cup
                              </p>
                              <button
                                type="button"
                                onClick={() => removeItem(item.name)}
                                className="text-xs uppercase tracking-[0.24em] text-sand/64 transition hover:text-white"
                              >
                                Remove
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
                  Customer Details
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-cream">
                  Checkout form
                </h2>

                <div className="mt-7 space-y-4">
                  <label className="block">
                    <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-sand/62">
                      Full Name
                    </span>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(event) => setCustomerName(event.target.value)}
                      placeholder="Nama pemesan"
                      className="w-full rounded-[1.2rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-cream outline-none transition placeholder:text-sand/35 focus:border-copper/50 focus:bg-white/[0.06]"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-sand/62">
                      Phone Number
                    </span>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(event) => setCustomerPhone(event.target.value)}
                      placeholder="08xxxxxxxxxx"
                      className="w-full rounded-[1.2rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-cream outline-none transition placeholder:text-sand/35 focus:border-copper/50 focus:bg-white/[0.06]"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-sand/62">
                      Pickup Note
                    </span>
                    <textarea
                      rows={4}
                      value={pickupNote}
                      onChange={(event) => setPickupNote(event.target.value)}
                      placeholder="Contoh: tanpa gula, pickup jam 14:00"
                      className="w-full rounded-[1.2rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-cream outline-none transition placeholder:text-sand/35 focus:border-copper/50 focus:bg-white/[0.06]"
                    />
                  </label>
                </div>
              </article>

              <article className="glass-panel rounded-[2rem] border border-white/10 p-6 md:p-7">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-sand/60">
                      Payment Summary
                    </p>
                    <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-cream">
                      Order recap
                    </h2>
                  </div>
                  <div className="rounded-full border border-white/10 px-3 py-1 text-[0.68rem] uppercase tracking-[0.24em] text-sand/78">
                    Live
                  </div>
                </div>

                <div className="mt-7 space-y-4">
                  <div className="flex items-center justify-between text-sm text-sand/70">
                    <span>Subtotal</span>
                    <span>{formatRupiah(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-sand/70">
                    <span>Service Fee</span>
                    <span>{formatRupiah(serviceFee)}</span>
                  </div>
                  <div className="h-px bg-white/10" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-[0.24em] text-sand/65">
                      Total
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
                  <div className="mt-5 rounded-[1.2rem] border border-copper/25 bg-[rgba(212,153,95,0.12)] px-4 py-3 text-sm text-cream">
                    {success}
                    {orderNumber ? ` Nomor order: ${orderNumber}.` : ""}
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                  className="mt-8 w-full rounded-full border border-copper/40 bg-copper px-6 py-3 text-sm font-medium uppercase tracking-[0.22em] text-[#1a0f09] transition hover:bg-[#e2a86d] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? "Submitting..." : "Place Order"}
                </button>

                <p className="mt-4 text-sm leading-6 text-sand/62">
                  Setelah checkout berhasil, order ini akan muncul di halaman
                  history pembelian pada admin panel.
                </p>
              </article>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
