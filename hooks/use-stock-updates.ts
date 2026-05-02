"use client";

import { useEffect, useState } from "react";
import { getReverbEcho } from "@/lib/reverb-client";
import type { MenuItemPayload } from "@/lib/menu-types";

/**
 * Hook to listen for real-time stock updates from Laravel Reverb.
 * 
 * @param initialItems The initial list of menu items.
 * @returns The updated list of menu items and the setter function.
 */
export function useStockUpdates(initialItems: MenuItemPayload[]) {
  const [items, setItems] = useState<MenuItemPayload[]>(initialItems);

  // Sync state if initialItems changes (e.g. after a fresh fetch)
  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  useEffect(() => {
    const echo = getReverbEcho();
    if (!echo) return;

    // Listen on the 'menu-items' public channel
    const channel = echo.channel("menu-items");
    
    // Listen for the stock updated event
    channel.listen("MenuItemStockUpdated", (event: { 
      menu_item_id: number; 
      stock: number 
    }) => {
      setItems((currentItems) =>
        currentItems.map((item) =>
          item.id === event.menu_item_id 
            ? { ...item, stock: event.stock } 
            : item
        )
      );
    });

    // Cleanup: leave the channel when component unmounts
    return () => {
      echo.leaveChannel("menu-items");
    };
  }, []);

  return { items, setItems };
}
