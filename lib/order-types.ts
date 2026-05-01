export type OrderHistoryFilter = "last_month" | "last_year" | "today";

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
  subtotal: number;
  service_fee: number;
  total: number;
  formatted_total: string;
  placed_at: string | null;
  items: OrderHistoryItem[];
};
