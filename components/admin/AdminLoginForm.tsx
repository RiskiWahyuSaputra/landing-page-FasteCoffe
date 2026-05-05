"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    console.log("1. Form login dikirim", { email, password });

    setError("");
    setIsSubmitting(true);

    try {
      console.log("2. Sebelum fetch ke /api/admin/login");

      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      console.log("3. Setelah fetch, status:", response.status);

      const payload = (await response.json().catch(() => null)) as {
        message?: string;
        token?: string;
        admin?: unknown;
      } | null;

      console.log("4. Payload login:", payload);

      if (!response.ok) {
        setError(payload?.message ?? "Login admin gagal.");
        return;
      }

      if (payload?.token) {
        localStorage.setItem("admin_token", payload.token);
      }

      if (payload?.admin) {
        localStorage.setItem("admin_user", JSON.stringify(payload.admin));
      }

      console.log("5. Redirect ke dashboard");

      router.replace("/admin/dashboard");
      router.refresh();
    } catch (error) {
      console.error("6. Login error:", error);
      setError("Backend Laravel belum bisa dijangkau dari frontend.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="glass-panel w-full max-w-md rounded-[2rem] border border-white/10 p-6 shadow-halo md:p-7">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.28em] text-sand/60">
          Login Aman
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-cream">
          Masuk Admin
        </h2>
        <p className="mt-3 text-sm leading-6 text-sand/72">
          Masuk dengan akun admin yang disediakan backend Laravel.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-sand/62">
            Email
          </span>
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-[1.2rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-cream outline-none transition placeholder:text-sand/35 focus:border-copper/50 focus:bg-white/[0.06]"
            placeholder="admin@fastecoffee.test"
            autoComplete="email"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-sand/62">
            Password
          </span>
          <input
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-[1.2rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-cream outline-none transition placeholder:text-sand/35 focus:border-copper/50 focus:bg-white/[0.06]"
            placeholder="Masukkan password admin"
            autoComplete="current-password"
          />
        </label>

        {error ? (
          <div className="rounded-[1.2rem] border border-[#c86b57]/35 bg-[#5a2018]/20 px-4 py-3 text-sm text-[#ffd8d1]">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-full border border-copper/40 bg-copper px-5 py-3 text-sm font-medium uppercase tracking-[0.24em] text-ink transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Memproses..." : "Masuk Admin"}
        </button>
      </form>
    </section>
  );
}
