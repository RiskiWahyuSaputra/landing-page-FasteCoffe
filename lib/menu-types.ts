export type MenuItemPayload = {
  id: number;
  name: string;
  description: string;
  price: number;
  formatted_price: string;
  accent: string;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string | null;
};
