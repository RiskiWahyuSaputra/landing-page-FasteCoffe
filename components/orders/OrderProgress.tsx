import { useLocale } from "@/components/LocaleProvider";
import { ORDER_STATUS_STEPS, getOrderStatusIndex, type OrderStatus } from "@/lib/order-status";

export default function OrderProgress({
  status,
  compact = false,
}: {
  status: OrderStatus;
  compact?: boolean;
}) {
  const { t } = useLocale();
  const activeIndex = getOrderStatusIndex(status);

  return (
    <div className={`grid gap-3 ${compact ? "sm:grid-cols-3" : "md:grid-cols-3"}`}>
      {ORDER_STATUS_STEPS.map((step, index) => {
        const isComplete = index <= activeIndex;
        const isCurrent = index === activeIndex;

        return (
          <div
            key={step.value}
            className={`rounded-[1.3rem] border px-4 py-4 transition ${
              isCurrent
                ? "border-copper/40 bg-[rgba(212,153,95,0.12)]"
                : isComplete
                  ? "border-emerald-500/20 bg-emerald-500/10"
                  : "border-white/10 bg-white/[0.03]"
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-semibold ${
                  isCurrent
                    ? "border-copper bg-copper text-[#1a0f09]"
                    : isComplete
                      ? "border-emerald-400/40 bg-emerald-400/20 text-emerald-300"
                      : "border-white/10 text-sand/60"
                }`}
              >
                {index + 1}
              </span>
              <div className="min-w-0">
                <p className={`text-sm font-semibold ${isCurrent ? "text-copper" : "text-cream"}`}>
                  {t(step.labelKey)}
                </p>
                <p className="mt-1 text-xs leading-5 text-sand/62">
                  {t(step.descriptionKey)}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
