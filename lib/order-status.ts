export const ORDER_STATUSES = [
  "received",
  "brewing",
  "ready_for_pickup",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_STEPS: Array<{
  description: string;
  label: string;
  value: OrderStatus;
}> = [
  {
    value: "received",
    label: "Pesanan Diterima",
    description: "Order sudah masuk ke sistem dan menunggu diproses.",
  },
  {
    value: "brewing",
    label: "Pesanan Sedang Dibuat",
    description: "Barista sedang menyiapkan minuman pesananmu.",
  },
  {
    value: "ready_for_pickup",
    label: "Pesanan Siap Diambil",
    description: "Pesanan selesai dan sudah siap diambil di counter.",
  },
];

export function getOrderStatusIndex(status: OrderStatus) {
  return ORDER_STATUS_STEPS.findIndex((step) => step.value === status);
}

export function getOrderStatusLabel(status: OrderStatus) {
  return (
    ORDER_STATUS_STEPS.find((step) => step.value === status)?.label ?? status
  );
}

export function getOrderStatusDescription(status: OrderStatus) {
  return (
    ORDER_STATUS_STEPS.find((step) => step.value === status)?.description ?? ""
  );
}
