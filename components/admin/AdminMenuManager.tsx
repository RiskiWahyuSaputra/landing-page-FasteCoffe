"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";

import { formatRupiah } from "@/lib/currency";
import type { MenuItemPayload } from "@/lib/menu-types";

const accentOptions = [
  "from-[#6a3c20] via-[#2f190f] to-[#140b08]",
  "from-[#c58b56] via-[#5f341f] to-[#160c08]",
  "from-[#dbc0a1] via-[#7b5638] to-[#120a07]",
  "from-[#8f5834] via-[#2a1810] to-[#120a07]",
  "from-[#efbc7e] via-[#87502b] to-[#170d08]",
  "from-[#c06a3e] via-[#492616] to-[#120807]"
];

export default function AdminMenuManager({
  initialItems
}: {
  initialItems: MenuItemPayload[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [accent, setAccent] = useState(accentOptions[0]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setAccent(accentOptions[0]);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/menu-items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          description,
          price: Number(price),
          accent,
          is_active: true
        })
      });

      const payload = (await response.json().catch(() => null)) as
        | { item?: MenuItemPayload; message?: string }
        | null;

      if (!response.ok || !payload?.item) {
        setError(payload?.message ?? "Gagal menambahkan menu.");
        return;
      }

      const createdItem = payload.item;

      setItems((current) =>
        [...current, createdItem].sort(
          (left, right) => left.sort_order - right.sort_order
        )
      );
      setSuccess(payload.message ?? "Menu berhasil ditambahkan.");
      resetForm();
      startTransition(() => router.refresh());
    } catch {
      setError("Tidak bisa terhubung ke endpoint admin menu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    setError("");
    setSuccess("");
    setDeletingId(id);

    try {
      const response = await fetch(`/api/admin/menu-items/${id}`, {
        method: "DELETE"
      });

      const payload = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;

      if (!response.ok) {
        setError(payload?.message ?? "Gagal menghapus menu.");
        return;
      }

      setItems((current) => current.filter((item) => item.id !== id));
      setSuccess(payload?.message ?? "Menu berhasil dihapus.");
      startTransition(() => router.refresh());
    } catch {
      setError("Tidak bisa menghapus menu dari server.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
      <article className="glass-panel rounded-[2rem] border border-white/10 p-6">
        <p className="text-xs uppercase tracking-[0.28em] text-sand/60">
          Add Menu
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-cream">
          Publish a new drink
        </h2>
        <p className="mt-3 text-sm leading-6 text-sand/70">
          Menu yang ditambahkan di sini akan langsung dipakai oleh section menu
          di landing page Next.js.
        </p>

        <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-sand/62">
              Nama Menu
            </span>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Contoh: Mocha Sea Salt"
              className="w-full rounded-[1.2rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-cream outline-none transition placeholder:text-sand/35 focus:border-copper/50 focus:bg-white/[0.06]"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-sand/62">
              Deskripsi
            </span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              placeholder="Rasa singkat yang tampil di halaman depan"
              className="w-full rounded-[1.2rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-cream outline-none transition placeholder:text-sand/35 focus:border-copper/50 focus:bg-white/[0.06]"
              required
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-sand/62">
                Harga
              </span>
              <input
                type="number"
                min="1000"
                step="1000"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                placeholder="18000"
                className="w-full rounded-[1.2rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-cream outline-none transition placeholder:text-sand/35 focus:border-copper/50 focus:bg-white/[0.06]"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-sand/62">
                Accent
              </span>
              <select
                value={accent}
                onChange={(event) => setAccent(event.target.value)}
                className="w-full rounded-[1.2rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-cream outline-none transition focus:border-copper/50 focus:bg-white/[0.06]"
              >
                {accentOptions.map((option, index) => (
                  <option key={option} value={option} className="bg-[#160e0a]">
                    Accent {index + 1}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {error ? (
            <div className="rounded-[1.2rem] border border-[#c86b57]/35 bg-[#5a2018]/20 px-4 py-3 text-sm text-[#ffd8d1]">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="rounded-[1.2rem] border border-copper/25 bg-[rgba(212,153,95,0.12)] px-4 py-3 text-sm text-cream">
              {success}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full border border-copper/40 bg-copper px-6 py-3 text-sm font-medium uppercase tracking-[0.22em] text-[#1a0f09] transition hover:bg-[#e2a86d] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Publishing..." : "Tambah Menu"}
          </button>
        </form>
      </article>

      <article className="glass-panel rounded-[2rem] border border-white/10 p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-sand/60">
              Current Menu
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-cream">
              Landing page menu source
            </h2>
          </div>
          <p className="text-sm leading-6 text-sand/68">
            {items.length} menu aktif tersimpan di backend.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-4"
            >
              <div className="flex gap-4">
                <div
                  className={`h-24 w-20 shrink-0 rounded-[1.2rem] bg-gradient-to-br ${item.accent}`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-cream">
                        {item.name}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-sand/72">
                        {item.description}
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-xs uppercase tracking-[0.22em] text-sand/58">
                        Harga
                      </p>
                      <p className="mt-2 text-lg font-semibold text-copper">
                        {formatRupiah(item.price)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-sand/62">
                      Sort Order {item.sort_order}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.22em] text-sand transition hover:border-[#c86b57]/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deletingId === item.id ? "Removing..." : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
