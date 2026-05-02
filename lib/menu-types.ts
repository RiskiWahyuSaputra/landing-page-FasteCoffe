import type { MenuCategory } from "@/lib/menu-category";

export type MenuItemPayload = {
  id: number;
  name: string;
  description: string;
  category: MenuCategory;
  price: number;
  formatted_price: string;
  accent: string;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
  stock: number;
  created_at: string | null;
};
