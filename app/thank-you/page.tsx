"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { useLocale } from "@/components/LocaleProvider";

type SavedFeedback = {
  note: string;
  orderRef: string;
  rating: number;
  submittedAt: string;
};

const FEEDBACK_STORAGE_KEY = "faste_customer_feedback";

function readFeedbackEntries() {
  if (typeof window === "undefined") {
    return [] as SavedFeedback[];
  }

  try {
    return JSON.parse(
      localStorage.getItem(FEEDBACK_STORAGE_KEY) || "[]",
    ) as SavedFeedback[];
  } catch {
    return [];
  }
}

function upsertFeedbackEntry(entry: SavedFeedback) {
  if (typeof window === "undefined") {
    return;
  }

  const nextEntries = [
    entry,
    ...readFeedbackEntries().filter(
      (savedEntry) => savedEntry.orderRef !== entry.orderRef,
    ),
  ];

  localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(nextEntries));
}

export default function ThankYouPage() {
  const searchParams = useSearchParams();
  const { t } = useLocale();
  const orderRef = searchParams.get("order") ?? "";
  const [rating, setRating] = useState(0);
  const [note, setNote] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (!orderRef) {
      return;
    }

    const existingFeedback = readFeedbackEntries().find(
      (entry) => entry.orderRef === orderRef,
    );

    if (!existingFeedback) {
      return;
    }

    setRating(existingFeedback.rating);
    setNote(existingFeedback.note);
    setIsSubmitted(true);
  }, [orderRef]);

  const ratingOptions = [
    {
      value: 1,
      label: t("rating_1_label"),
      description: t("rating_1_desc"),
    },
    {
      value: 2,
      label: t("rating_2_label"),
      description: t("rating_2_desc"),
    },
    {
      value: 3,
      label: t("rating_3_label"),
      description: t("rating_3_desc"),
    },
    {
      value: 4,
      label: t("rating_4_label"),
      description: t("rating_4_desc"),
    },
    {
      value: 5,
      label: t("rating_5_label"),
      description: t("rating_5_desc"),
    },
  ];

  const handleSubmit = () => {
    if (!rating) {
      return;
    }

    if (orderRef) {
      upsertFeedbackEntry({
        orderRef,
        rating,
        note: note.trim(),
        submittedAt: new Date().toISOString(),
      });
    }

    setIsSubmitted(true);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-page px-4 py-16 sm:px-6 md:px-10 md:py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(212,153,95,0.22),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(89,49,28,0.3),transparent_34%),linear-gradient(180deg,#140c08_0%,#0d0806_100%)]" />

      <div className="page-shell relative">
        <section className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <article className="overflow-hidden rounded-[2.2rem] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.3)] sm:p-8 md:p-10">
            <div className="inline-flex items-center gap-3 rounded-full border border-copper/25 bg-[rgba(212,153,95,0.12)] px-4 py-2 text-[0.68rem] uppercase tracking-[0.28em] text-copper">
              <span className="h-2 w-2 rounded-full bg-copper" />
              {t("thank_you_badge")}
            </div>

            <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-[-0.06em] text-cream sm:text-5xl md:text-6xl">
              {t("thank_you_title")}
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-sand/72 sm:text-lg">
              {t("thank_you_desc")}
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
              {orderRef ? (
                <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] px-5 py-4">
                  <p className="text-[0.68rem] uppercase tracking-[0.24em] text-sand/52">
                    {t("thank_you_order_label")}
                  </p>
                  <p className="mt-2 text-lg font-semibold text-cream">
                    {orderRef}
                  </p>
                </div>
              ) : null}

              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] px-5 py-4">
                <p className="text-[0.68rem] uppercase tracking-[0.24em] text-sand/52">
                  {t("order_ready_for_pickup")}
                </p>
                <p className="mt-2 text-lg font-semibold text-copper">
                  Faste Coffee
                </p>
              </div>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] px-5 py-5">
                <p className="text-[0.68rem] uppercase tracking-[0.24em] text-sand/52">
                  01
                </p>
                <p className="mt-3 text-base font-medium text-cream">
                  {t("order_ready_for_pickup")}
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] px-5 py-5">
                <p className="text-[0.68rem] uppercase tracking-[0.24em] text-sand/52">
                  02
                </p>
                <p className="mt-3 text-base font-medium text-cream">
                  {t("thank_you_rating_prompt")}
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] px-5 py-5">
                <p className="text-[0.68rem] uppercase tracking-[0.24em] text-sand/52">
                  03
                </p>
                <p className="mt-3 text-base font-medium text-cream">
                  {t("thank_you_note_label")}
                </p>
              </div>
            </div>
          </article>

          <article className="overflow-hidden rounded-[2.2rem] border border-copper/18 bg-[linear-gradient(180deg,rgba(47,28,20,0.92),rgba(25,14,10,0.95))] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.36)] sm:p-8 md:p-10">
            {isSubmitted ? (
              <div className="flex h-full flex-col justify-between gap-8">
                <div>
                  <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] border border-copper/30 bg-[rgba(212,153,95,0.14)] text-copper">
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </div>

                  <p className="mt-6 text-[0.72rem] uppercase tracking-[0.28em] text-sand/52">
                    {t("thank_you_badge")}
                  </p>
                  <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-cream sm:text-4xl">
                    {t("thank_you_saved")}
                  </h2>
                  <p className="mt-4 max-w-xl text-base leading-8 text-sand/70">
                    {t("thank_you_saved_desc")}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Link
                    href="/"
                    className="inline-flex items-center justify-center rounded-full border border-copper/28 bg-copper px-6 py-3 text-sm font-medium uppercase tracking-[0.22em] text-[#1a0f09] transition hover:bg-[#e2a86d]"
                  >
                    {t("thank_you_home")}
                  </Link>
                  <Link
                    href="/#menu"
                    className="inline-flex items-center justify-center rounded-full border border-white/12 px-6 py-3 text-sm font-medium uppercase tracking-[0.22em] text-sand transition hover:border-copper/35 hover:text-white"
                  >
                    {t("thank_you_order_again")}
                  </Link>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-[0.72rem] uppercase tracking-[0.28em] text-sand/52">
                  {t("thank_you_rating_prompt")}
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-cream sm:text-4xl">
                  {t("thank_you_rating_prompt")}
                </h2>
                <p className="mt-4 text-base leading-8 text-sand/70">
                  {t("thank_you_rating_desc")}
                </p>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {ratingOptions.map((option) => {
                    const isActive = rating === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setRating(option.value)}
                        className={`rounded-[1.6rem] border px-4 py-4 text-left transition ${
                          isActive
                            ? "border-copper/45 bg-[rgba(212,153,95,0.14)]"
                            : "border-white/10 bg-white/[0.03] hover:border-copper/28 hover:bg-white/[0.05]"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p
                              className={`text-base font-semibold ${isActive ? "text-copper" : "text-cream"}`}
                            >
                              {option.label}
                            </p>
                            <p className="mt-1 text-sm leading-6 text-sand/62">
                              {option.description}
                            </p>
                          </div>
                          <div className="flex gap-1 text-copper">
                            {Array.from({ length: option.value }).map((_, index) => (
                              <span key={index}>★</span>
                            ))}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <label className="mt-6 block">
                  <span className="mb-3 block text-xs uppercase tracking-[0.24em] text-sand/56">
                    {t("thank_you_note_label")}
                  </span>
                  <textarea
                    rows={5}
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder={t("thank_you_note_placeholder")}
                    className="w-full rounded-[1.5rem] border border-white/10 bg-white/[0.04] px-4 py-4 text-cream outline-none transition placeholder:text-sand/34 focus:border-copper/40 focus:bg-white/[0.06]"
                  />
                </label>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!rating}
                    className="inline-flex items-center justify-center rounded-full border border-copper/35 bg-copper px-6 py-3 text-sm font-medium uppercase tracking-[0.22em] text-[#1a0f09] transition hover:bg-[#e2a86d] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {t("thank_you_submit")}
                  </button>
                  <Link
                    href="/"
                    className="inline-flex items-center justify-center rounded-full border border-white/12 px-6 py-3 text-sm font-medium uppercase tracking-[0.22em] text-sand transition hover:border-copper/35 hover:text-white"
                  >
                    {t("thank_you_skip")}
                  </Link>
                </div>
              </div>
            )}
          </article>
        </section>
      </div>
    </main>
  );
}
