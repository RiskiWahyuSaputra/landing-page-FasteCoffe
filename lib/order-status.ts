export const ORDER_STATUSES = [
  "received",
  "brewing",
  "ready_for_pickup",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_STEPS: Array<{
  descriptionKey: string;
  labelKey: string;
  value: OrderStatus;
}> = [
  {
    value: "received",
    labelKey: "order_received",
    descriptionKey: "order_received_desc",
  },
  {
    value: "brewing",
    labelKey: "order_brewing",
    descriptionKey: "order_brewing_desc",
  },
  {
    value: "ready_for_pickup",
    labelKey: "order_ready_for_pickup",
    descriptionKey: "order_ready_for_pickup_desc",
  },
];

export function getOrderStatusIndex(status: OrderStatus) {
  return ORDER_STATUS_STEPS.findIndex((step) => step.value === status);
}

export function getOrderStatusLabel(
  status: OrderStatus,
  t?: (key: string) => string,
) {
  const step = ORDER_STATUS_STEPS.find((s) => s.value === status);
  if (!step) return status;
  return t ? t(step.labelKey) : step.labelKey;
}

export function getOrderStatusDescription(
  status: OrderStatus,
  t?: (key: string) => string,
) {
  const step = ORDER_STATUS_STEPS.find((s) => s.value === status);
  if (!step) return "";
  return t ? t(step.descriptionKey) : step.descriptionKey;
}
