import type { OrderStatus } from "@/lib/order-status";

export type OrderHistoryFilter = "all" | "last_month" | "last_year" | "today" | "yesterday";

export type OrderHistoryItem = {
  id: number;
  name: string;
  unit_price: number;
  quantity: number;
  line_total: number;
  image_url: string | null;
};

export type OrderHistoryEntry = {
  id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  pickup_note: string | null;
  payment_method: string;
  payment_proof_url: string | null;
  status: OrderStatus;
  subtotal: number;
  service_fee: number;
  total: number;
  formatted_total: string;
  placed_at: string | null;
  items: OrderHistoryItem[];
};
