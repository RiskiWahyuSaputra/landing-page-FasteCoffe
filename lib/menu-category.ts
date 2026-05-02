export const MENU_CATEGORIES = [
  "coffee",
  "non_coffee",
  "main_course",
  "snack",
] as const;

export type MenuCategory = (typeof MENU_CATEGORIES)[number];

export function getMenuCategoryTranslationKey(category: MenuCategory) {
  switch (category) {
    case "coffee":
      return "menu_category_coffee";
    case "non_coffee":
      return "menu_category_non_coffee";
    case "main_course":
      return "menu_category_main_course";
    case "snack":
      return "menu_category_snack";
  }
}

export function getMenuCategoryAdminLabel(category: MenuCategory) {
  switch (category) {
    case "coffee":
      return "Coffee";
    case "non_coffee":
      return "Non Coffee";
    case "main_course":
      return "Makanan Berat";
    case "snack":
      return "Makanan Ringan";
  }
}
