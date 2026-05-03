"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";

import { formatRupiah } from "@/lib/currency";
import {
  MENU_CATEGORIES,
  getMenuCategoryAdminLabel,
} from "@/lib/menu-category";
import type { MenuItemPayload } from "@/lib/menu-types";

const accentOptions = [
  "from-[#6a3c20] via-[#2f190f] to-[#140b08]",
  "from-[#c58b56] via-[#5f341f] to-[#160c08]",
  "from-[#dbc0a1] via-[#7b5638] to-[#120a07]",
  "from-[#8f5834] via-[#2a1810] to-[#120a07]",
  "from-[#efbc7e] via-[#87502b] to-[#170d08]",
  "from-[#c06a3e] via-[#492616] to-[#120807]",
];

const MAX_IMAGE_SIZE_BYTES = 4 * 1024 * 1024;
const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/bmp",
  "image/gif",
  "image/svg+xml",
  "image/webp",
]);

export default function AdminMenuManager({
  initialItems,
}: {
  initialItems: MenuItemPayload[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [editingItem, setEditingItem] = useState<MenuItemPayload | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<(typeof MENU_CATEGORIES)[number]>("coffee");
  const [price, setPrice] = useState("");
  const [accent, setAccent] = useState(accentOptions[0]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const resetForm = () => {
    setEditingItem(null);
    setName("");
    setDescription("");
    setCategory("coffee");
    setPrice("");
    setAccent(accentOptions[0]);
    setImageFile(null);
    setImagePreview("");
  };

  const fillFormForEdit = (item: MenuItemPayload) => {
    setEditingItem(item);
    setName(item.name);
    setDescription(item.description);
    setCategory(item.category);
    setPrice(String(item.price));
    setAccent(item.accent);
    setImageFile(null);
    setImagePreview(item.image_url ?? "");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("price", String(Number(price)));
      formData.append("accent", accent);
      formData.append("is_active", "1");

      if (imageFile) {
        formData.append("image", imageFile);
      }

      const response = await fetch(
        editingItem
          ? `/api/admin/menu-items/${editingItem.id}`
          : "/api/admin/menu-items",
        {
          method: "POST",
          body: formData,
        },
      );

      const payload = (await response.json().catch(() => null)) as {
        item?: MenuItemPayload;
        message?: string;
      } | null;

      if (!response.ok || !payload?.item) {
        setError(payload?.message ?? "Gagal menambahkan menu.");
        return;
      }

      const createdItem = payload.item;

      setItems((current) =>
        (editingItem
          ? current.map((item) =>
              item.id === createdItem.id ? createdItem : item,
            )
          : [...current, createdItem]
        ).sort((left, right) => left.sort_order - right.sort_order),
      );
      setSuccess(
        payload.message ??
          (editingItem
            ? "Menu berhasil diperbarui."
            : "Menu berhasil ditambahkan."),
      );
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
        method: "DELETE",
      });

      const payload = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;

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

  const formHeading = editingItem ? "Edit item menu" : "Publikasikan item menu baru";
  const formDescription = editingItem
    ? "Perbarui nama, harga, deskripsi, atau ganti gambar menu yang sudah tayang."
    : "Menu yang ditambahkan di sini akan langsung dipakai oleh section menu di halaman utama Next.js.";

  return (
    <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
      <article className="glass-panel rounded-[2rem] border border-white/10 p-4 sm:p-6">
        <p className="text-xs uppercase tracking-[0.28em] text-sand/60">
          {editingItem ? "Edit Menu" : "Tambah Menu"}
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-cream sm:text-3xl">
          {formHeading}
        </h2>
        <p className="mt-3 text-sm leading-6 text-sand/70">{formDescription}</p>

        <form className="mt-5 space-y-4 sm:mt-7" onSubmit={handleSubmit}>
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

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-sand/62">
                Kategori
              </span>
              <select
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value as (typeof MENU_CATEGORIES)[number])
                }
                className="w-full rounded-[1.2rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-cream outline-none transition focus:border-copper/50 focus:bg-white/[0.06]"
              >
                {MENU_CATEGORIES.map((option) => (
                  <option key={option} value={option} className="bg-[#160e0a]">
                    {getMenuCategoryAdminLabel(option)}
                  </option>
                ))}
              </select>
            </label>

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
                Aksen
              </span>
              <select
                value={accent}
                onChange={(event) => setAccent(event.target.value)}
                className="w-full rounded-[1.2rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-cream outline-none transition focus:border-copper/50 focus:bg-white/[0.06]"
              >
                {accentOptions.map((option, index) => (
                  <option key={option} value={option} className="bg-[#160e0a]">
                    Aksen {index + 1}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-sand/62">
              Gambar Menu
            </span>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.bmp,.gif,.svg,.webp,image/jpeg,image/png,image/bmp,image/gif,image/svg+xml,image/webp"
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                setError("");

                if (!file) {
                  setImageFile(null);
                  setImagePreview(editingItem?.image_url ?? "");
                  return;
                }

                if (!allowedMimeTypes.has(file.type)) {
                  setImageFile(null);
                  setImagePreview(editingItem?.image_url ?? "");
                  setError(
                    "Format gambar tidak didukung. Gunakan JPG, JPEG, PNG, BMP, GIF, SVG, atau WEBP.",
                  );
                  event.currentTarget.value = "";
                  return;
                }

                if (file.size > MAX_IMAGE_SIZE_BYTES) {
                  setImageFile(null);
                  setImagePreview(editingItem?.image_url ?? "");
                  setError("Ukuran gambar maksimal 4 MB.");
                  event.currentTarget.value = "";
                  return;
                }

                setImageFile(file);
                setImagePreview(URL.createObjectURL(file));
              }}
              className="w-full rounded-[1.2rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-cream outline-none file:mr-4 file:rounded-full file:border-0 file:bg-copper file:px-4 file:py-2 file:text-xs file:font-medium file:uppercase file:tracking-[0.18em] file:text-ink"
            />
            <p className="mt-3 text-xs leading-6 text-sand/62">
              Format yang didukung: JPG, JPEG, PNG, BMP, GIF, SVG, WEBP.
              Maksimal ukuran file: 4 MB.
            </p>
          </label>

          {imagePreview ? (
            <div className="overflow-hidden rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-3">
              <img
                src={imagePreview}
                alt="Pratinjau menu"
                className="h-48 w-full rounded-[1rem] object-cover"
              />
            </div>
          ) : null}

          {error ? (
            <div className="rounded-[1.2rem] border border-[#c86b57]/35 bg-[#5a2018]/20 px-4 py-3 text-sm text-[#ffd8d1]">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="rounded-[1.2rem] border border-copper/25 bg-copper/12 px-4 py-3 text-sm text-cream">
              {success}
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full border border-copper/40 bg-copper px-6 py-3 text-sm font-medium uppercase tracking-[0.22em] text-ink transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting
                ? editingItem
                  ? "Menyimpan..."
                  : "Menerbitkan..."
                : editingItem
                  ? "Perbarui Menu"
                  : "Tambah Menu"}
            </button>
            {editingItem ? (
              <button
                type="button"
                onClick={resetForm}
                className="w-full rounded-full border border-white/10 px-6 py-3 text-sm font-medium uppercase tracking-[0.22em] text-sand transition hover:border-copper/40 hover:text-white"
              >
                Batal Edit
              </button>
            ) : null}
          </div>
        </form>
      </article>

      <article className="glass-panel rounded-[2rem] border border-white/10 p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-sand/60">
              Menu Saat Ini
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-cream sm:text-3xl">
              Sumber menu halaman utama
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
                >
                  {item.image_url ? (
                    <img
                      src={item.image_url}
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
                      <p className="mt-2 text-xs uppercase tracking-[0.22em] text-copper">
                        {getMenuCategoryAdminLabel(item.category)}
                      </p>
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
                      Urutan Tampil {item.sort_order}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fillFormForEdit(item)}
                        className="rounded-full border border-copper/25 bg-copper/10 px-4 py-2 text-xs uppercase tracking-[0.22em] text-copper transition hover:border-copper/50 hover:bg-copper hover:text-ink"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                        className="rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.22em] text-sand transition hover:border-[#c86b57]/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {deletingId === item.id ? "Menghapus..." : "Hapus"}
                      </button>
                    </div>
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
