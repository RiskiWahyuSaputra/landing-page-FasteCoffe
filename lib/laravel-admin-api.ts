// server-only is a side-effect import to prevent this module from being used in Client Components
// If this causes issues in the build, remove the line below.

import type { MenuItemPayload } from "@/lib/menu-types";
import type { OrderHistoryEntry, OrderHistoryFilter } from "@/lib/order-types";
import type { OrderStatus } from "@/lib/order-status";

const DEFAULT_LARAVEL_API_URL = "http://127.0.0.1:8000/api";
const LARAVEL_API_URL = process.env.LARAVEL_API_URL ?? DEFAULT_LARAVEL_API_URL;

export type AdminUser = {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
  created_at: string | null;
};

export type AdminDashboardPayload = {
  user: AdminUser;
  stats: {
    total_users: number;
    total_admins: number;
    total_menu_items: number;
    total_orders: number;
    active_admin_sessions: number;
    backend_status: string;
  };
  session: {
    issued_at: string | null;
    last_used_at: string | null;
    expires_at: string | null;
  };
  meta: {
    app_name: string;
    environment: string;
    server_time: string;
  };
};

type AdminLoginResponse = {
  message: string;
  token: string;
  user: AdminUser;
  session: {
    issued_at: string | null;
    expires_at: string | null;
  };
};

type AdminProfileResponse = {
  user: AdminUser;
};

type LaravelErrorPayload = {
  message?: string;
  errors?: Record<string, string[]>;
};

export class LaravelApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "LaravelApiError";
    this.status = status;
  }
}

function getMultipartHeaders(token?: string) {
  return {
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function callLaravel<T>(
  path: string,
  {
    body,
    method = "GET",
    token,
  }: {
    body?: FormData | unknown;
    method?: "DELETE" | "GET" | "POST";
    token?: string;
  } = {},
): Promise<T> {
  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;
  const response = await fetch(`${LARAVEL_API_URL}${path}`, {
    method,
    headers: {
      Accept: "application/json",
      ...(!isFormData && body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body
      ? {
          body: isFormData ? body : JSON.stringify(body),
        }
      : {}),
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => null)) as
    | LaravelErrorPayload
    | T
    | null;

  if (!response.ok) {
    const message =
      payload &&
      typeof payload === "object" &&
      "errors" in payload &&
      payload.errors &&
      Object.values(payload.errors)[0]?.[0]
        ? Object.values(payload.errors)[0][0]
        : payload &&
            typeof payload === "object" &&
            "message" in payload &&
            typeof payload.message === "string"
          ? payload.message
          : "Laravel API request failed.";

    throw new LaravelApiError(message, response.status);
  }

  return payload as T;
}

export function loginAdmin(email: string, password: string) {
  return callLaravel<AdminLoginResponse>("/admin/login", {
    method: "POST",
    body: { email, password },
  });
}

export async function getAdminProfile(token: string) {
  const response = await callLaravel<AdminProfileResponse>("/admin/me", {
    token,
  });

  return response.user;
}

export function getAdminDashboard(token: string) {
  return callLaravel<AdminDashboardPayload>("/admin/dashboard", {
    token,
  });
}

export function logoutAdmin(token: string) {
  return callLaravel<{ message: string }>("/admin/logout", {
    method: "POST",
    token,
  });
}

export async function getPublicMenuItems() {
  const response = await callLaravel<{ items: MenuItemPayload[] }>(
    "/menu-items",
  );
  return response.items;
}

export async function getAdminMenuItems(token: string) {
  const response = await callLaravel<{ items: MenuItemPayload[] }>(
    "/admin/menu-items",
    { token },
  );
  return response.items;
}

export function createAdminMenuItem(token: string, body: FormData) {
  return callLaravel<{ item: MenuItemPayload; message: string }>(
    "/admin/menu-items",
    {
      method: "POST",
      body,
      token,
    },
  );
}

export async function updateAdminMenuItem(
  token: string,
  id: number,
  body: FormData,
) {
  const response = await fetch(`${LARAVEL_API_URL}/admin/menu-items/${id}`, {
    method: "POST",
    headers: getMultipartHeaders(token),
    body,
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => null)) as
    | LaravelErrorPayload
    | { item: MenuItemPayload; message: string }
    | null;

  if (!response.ok) {
    const message =
      payload &&
      typeof payload === "object" &&
      "errors" in payload &&
      payload.errors &&
      Object.values(payload.errors)[0]?.[0]
        ? Object.values(payload.errors)[0][0]
        : payload &&
            typeof payload === "object" &&
            "message" in payload &&
            typeof payload.message === "string"
          ? payload.message
          : "Laravel API request failed.";

    throw new LaravelApiError(message, response.status);
  }

  return payload as { item: MenuItemPayload; message: string };
}

export function deleteAdminMenuItem(token: string, id: number) {
  return callLaravel<{ message: string }>(`/admin/menu-items/${id}`, {
    method: "DELETE",
    token,
  });
}

export async function createOrder(
  body:
    | FormData
    | {
        customer_name: string;
        customer_phone: string;
        pickup_note?: string;
        payment_method: string;
        service_fee: number;
        items: Array<{
          name: string;
          description: string;
          quantity: number;
          numeric_price: number;
          image_url?: string | null;
        }>;
      },
) {
  return callLaravel<{
    message: string;
    order: OrderHistoryEntry;
  }>("/orders", {
    method: "POST",
    body,
  });
}

export async function getAdminOrders(
  token: string,
  filter: OrderHistoryFilter = "today",
) {
  return callLaravel<{
    filter: OrderHistoryFilter;
    summary: { count: number; revenue: number };
    orders: OrderHistoryEntry[];
  }>(`/admin/orders?filter=${filter}`, {
    token,
  });
}

export function updateAdminOrderStatus(
  token: string,
  id: number,
  status: OrderStatus,
) {
  return callLaravel<{
    message: string;
    order: OrderHistoryEntry;
  }>(`/admin/orders/${id}/status`, {
    method: "POST",
    token,
    body: { status },
  });
}

export function deleteAdminOrderPaymentProof(token: string, id: number) {
  return callLaravel<{
    message: string;
    order: OrderHistoryEntry;
  }>(`/admin/orders/${id}/payment-proof`, {
    method: "DELETE",
    token,
  });
}

export async function getOrderById(id: string) {
  // Public endpoint: no token needed, but requires authentication in Laravel
  const response = await callLaravel<OrderHistoryEntry>(`/orders/${id}`);
  return {
    id: response.id,
    order_number: response.order_number,
    status: response.status,
    customer_name: response.customer_name,
    customer_phone: response.customer_phone,
    total: response.total,
    placed_at: response.placed_at,
  };
}
