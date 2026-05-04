"use client";

import { useState } from "react";
import type { OrderHistoryFilter } from "@/lib/order-types";

export function DownloadPdfButton({ filter }: { filter: OrderHistoryFilter }) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = () => {
    setIsDownloading(true);
    
    // Create a hidden iframe
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = `/api/admin/reports/export-pdf?filter=${filter}`;
    
    document.body.appendChild(iframe);

    // Remove the iframe after a short delay to allow print dialog to open
    // and cleanup the DOM
    setTimeout(() => {
      document.body.removeChild(iframe);
      setIsDownloading(false);
    }, 5000);
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isDownloading}
      className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <svg
        className={`h-4 w-4 ${isDownloading ? "animate-spin" : ""}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        {isDownloading ? (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        ) : (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        )}
      </svg>
      {isDownloading ? "Menyiapkan PDF..." : "Download PDF"}
    </button>
  );
}
