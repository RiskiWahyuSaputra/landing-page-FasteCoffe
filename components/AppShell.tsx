"use client";

import { usePathname } from "next/navigation";

import CartDrawer from "@/components/CartDrawer";
import { CartProvider } from "@/components/CartProvider";
import SmoothScroll from "@/components/SmoothScroll";

export default function AppShell({
  children
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <CartProvider>
      <SmoothScroll />
      {children}
      <CartDrawer />
    </CartProvider>
  );
}
