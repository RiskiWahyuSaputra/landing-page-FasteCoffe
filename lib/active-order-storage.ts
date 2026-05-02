import type { OrderStatus } from "@/lib/order-status";

export type SavedOrder = {
  id: number;
  order_number: string;
  status: OrderStatus;
};

const ORDERS_STORAGE_KEY = "faste_orders";
const CURRENT_ORDER_STORAGE_KEY = "faste_current_order_id";
const HIDDEN_STATUS: OrderStatus = "ready_for_pickup";

function canUseStorage() {
  return typeof window !== "undefined";
}

export function shouldHideOrderFromCheckout(status: OrderStatus) {
  return status === HIDDEN_STATUS;
}

export function readSavedOrders(): SavedOrder[] {
  if (!canUseStorage()) {
    return [];
  }

  try {
    return JSON.parse(localStorage.getItem(ORDERS_STORAGE_KEY) || "[]") as SavedOrder[];
  } catch {
    return [];
  }
}

export function writeSavedOrders(orders: SavedOrder[]) {
  if (!canUseStorage()) {
    return;
  }

  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
}

export function getCurrentOrderId() {
  if (!canUseStorage()) {
    return null;
  }

  return localStorage.getItem(CURRENT_ORDER_STORAGE_KEY);
}

export function setCurrentOrderId(orderId: number) {
  if (!canUseStorage()) {
    return;
  }

  localStorage.setItem(CURRENT_ORDER_STORAGE_KEY, String(orderId));
}

export function clearCurrentOrderId(orderId?: number) {
  if (!canUseStorage()) {
    return;
  }

  if (typeof orderId === "number") {
    const currentOrderId = getCurrentOrderId();
    if (currentOrderId !== String(orderId)) {
      return;
    }
  }

  localStorage.removeItem(CURRENT_ORDER_STORAGE_KEY);
}

export function removeSavedOrder(orderId: number) {
  const nextOrders = readSavedOrders().filter((order) => order.id !== orderId);
  writeSavedOrders(nextOrders);
  clearCurrentOrderId(orderId);
}

export function upsertSavedOrder(order: SavedOrder) {
  if (shouldHideOrderFromCheckout(order.status)) {
    removeSavedOrder(order.id);
    return;
  }

  const nextOrders = [
    order,
    ...readSavedOrders().filter((savedOrder) => savedOrder.id !== order.id),
  ];
  writeSavedOrders(nextOrders);
}

export function syncSavedOrderStatus(orderId: number, status: OrderStatus) {
  if (shouldHideOrderFromCheckout(status)) {
    removeSavedOrder(orderId);
    return;
  }

  const nextOrders = readSavedOrders().map((order) =>
    order.id === orderId ? { ...order, status } : order,
  );
  writeSavedOrders(nextOrders);
}

export function getRestorableOrder() {
  const currentOrderId = getCurrentOrderId();

  if (!currentOrderId) {
    return null;
  }

  const order = readSavedOrders().find((savedOrder) => String(savedOrder.id) === currentOrderId);

  if (!order) {
    clearCurrentOrderId();
    return null;
  }

  if (shouldHideOrderFromCheckout(order.status)) {
    removeSavedOrder(order.id);
    return null;
  }

  return order;
}
