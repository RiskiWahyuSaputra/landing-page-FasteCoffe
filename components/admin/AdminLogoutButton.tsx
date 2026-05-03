"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogoutButton() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogout = async () => {
    setIsSubmitting(true);

    try {
      await fetch("/api/admin/logout", {
        method: "POST"
      });
    } finally {
      startTransition(() => {
        router.replace("/admin/login");
        router.refresh();
      });
      setIsSubmitting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isSubmitting}
      className="rounded-full border border-white/10 px-5 py-3 text-xs uppercase tracking-[0.24em] text-sand transition hover:border-copper/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-70"
    >
      {isSubmitting ? "Keluar..." : "Keluar"}
    </button>
  );
}
