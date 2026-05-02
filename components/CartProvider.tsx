"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState
} from "react";
import type { MenuCategory } from "@/lib/menu-category";

export type CartMenuItem = {
  name: string;
  description: string;
  category: MenuCategory;
  price: string;
  accent: string;
  imageUrl?: string | null;
};

export type CartItem = CartMenuItem & {
  quantity: number;
  numericPrice: number;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (item: CartMenuItem) => void;
  increaseItem: (name: string) => void;
  decreaseItem: (name: string) => void;
  removeItem: (name: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function parsePrice(price: string) {
  const normalized = price.replace(/[^0-9]/g, "");
  return Number(normalized || 0);
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addItem = (item: CartMenuItem) => {
    const numericPrice = parsePrice(item.price);

    setItems((currentItems) => {
      const existing = currentItems.find((entry) => entry.name === item.name);

      if (existing) {
        return currentItems.map((entry) =>
          entry.name === item.name
            ? { ...entry, quantity: entry.quantity + 1 }
            : entry
        );
      }

      return [...currentItems, { ...item, numericPrice, quantity: 1 }];
    });
  };

  const increaseItem = (name: string) => {
    setItems((currentItems) =>
      currentItems.map((entry) =>
        entry.name === name ? { ...entry, quantity: entry.quantity + 1 } : entry
      )
    );
  };

  const decreaseItem = (name: string) => {
    setItems((currentItems) =>
      currentItems
        .map((entry) =>
          entry.name === name ? { ...entry, quantity: entry.quantity - 1 } : entry
        )
        .filter((entry) => entry.quantity > 0)
    );
  };

  const removeItem = (name: string) => {
    setItems((currentItems) => currentItems.filter((entry) => entry.name !== name));
  };

  const clearCart = () => {
    setItems([]);
    setIsCartOpen(false);
  };

  const value = useMemo(() => {
    const itemCount = items.reduce((total, item) => total + item.quantity, 0);
    const subtotal = items.reduce(
      (total, item) => total + item.numericPrice * item.quantity,
      0
    );

    return {
      items,
      itemCount,
      subtotal,
      isCartOpen,
      openCart: () => setIsCartOpen(true),
      closeCart: () => setIsCartOpen(false),
      toggleCart: () => setIsCartOpen((current) => !current),
      addItem,
      increaseItem,
      decreaseItem,
      removeItem,
      clearCart
    };
  }, [isCartOpen, items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
}
