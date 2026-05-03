"use client";

import { useEffect, useState } from "react";
import { updateProductImage, LaravelApiError } from "@/lib/laravel-admin-api";
import { getReverbEcho } from "@/lib/reverb-client";

interface ImageUpdaterProps {
  productId: number;
  initialImageUrl?: string;
  token: string;
}

export default function ImageUpdater({
  productId,
  initialImageUrl,
  token,
}: ImageUpdaterProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(initialImageUrl || "");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [realtimeNotice, setRealtimeNotice] = useState("");

  useEffect(() => {
    const echo = getReverbEcho();
    if (!echo) return;

    // Listen on the 'products' channel for real-time updates
    const channel = echo.channel("products");
    
    channel.listen(
      "ProductImageUpdated",
      (event: { product_id: number; image_url: string }) => {
        if (event.product_id === productId) {
          // Update the preview automatically when backend broadcasts the change
          setPreview(event.image_url);
          setRealtimeNotice("Gambar produk telah diperbarui secara real-time!");
          
          // Clear notice after 5 seconds
          setTimeout(() => setRealtimeNotice(""), 5000);
        }
      }
    );

    return () => {
      echo.leaveChannel("products");
    };
  }, [productId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Basic validation
      if (selectedFile.size > 4 * 1024 * 1024) {
        setError("Ukuran gambar maksimal 4 MB.");
        return;
      }
      
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setError("");
      setSuccess("");
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError("");
    setSuccess("");

    try {
      const result = await updateProductImage(token, productId, file);
      setSuccess(result.message);
      setFile(null);
    } catch (err) {
      if (err instanceof LaravelApiError) {
        setError(err.message);
      } else {
        setError("Terjadi kesalahan saat mengunggah gambar.");
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="glass-panel rounded-[2rem] border border-white/10 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-sand/60">
            Manajemen Gambar
          </p>
          <h3 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-cream">
            Perbarui Gambar Produk
          </h3>
        </div>
      </div>

      <div className="mt-6 space-y-5">
        {/* Preview Area */}
        <div className="relative aspect-video w-full overflow-hidden rounded-[1.4rem] border border-white/10 bg-white/[0.03]">
          {preview ? (
            <img
              src={preview}
              alt="Pratinjau Produk"
              className="h-full w-full object-cover transition-opacity duration-500"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sand/40">
              Belum ada gambar dipilih
            </div>
          )}
          
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-copper border-t-transparent"></div>
            </div>
          )}
        </div>

        {/* Status Messages */}
        {error && (
          <div className="rounded-[1.2rem] border border-[#c86b57]/35 bg-[#5a2018]/20 px-4 py-3 text-sm text-[#ffd8d1]">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-[1.2rem] border border-copper/25 bg-copper/12 px-4 py-3 text-sm text-cream">
            {success}
          </div>
        )}

        {realtimeNotice && (
          <div className="animate-pulse rounded-[1.2rem] border border-copper/40 bg-copper/10 px-4 py-3 text-sm font-medium text-copper">
            ✨ {realtimeNotice}
          </div>
        )}

        {/* Input & Button */}
        <div className="space-y-4">
          <input
            type="file"
            onChange={handleFileChange}
            accept="image/*"
            disabled={isUploading}
            className="w-full rounded-[1.2rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-cream outline-none transition file:mr-4 file:rounded-full file:border-0 file:bg-copper file:px-4 file:py-2 file:text-xs file:font-medium file:uppercase file:tracking-[0.18em] file:text-ink hover:bg-white/[0.06] disabled:opacity-50"
          />

          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="w-full rounded-full bg-copper py-4 text-sm font-bold uppercase tracking-[0.24em] text-ink transition hover:scale-[1.02] hover:brightness-110 active:scale-[0.98] disabled:scale-100 disabled:opacity-50"
          >
            {isUploading ? "Mengunggah..." : "Simpan Perubahan"}
          </button>
        </div>
      </div>
    </div>
  );
}
