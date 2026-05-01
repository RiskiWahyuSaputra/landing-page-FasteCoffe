import "server-only";

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

async function callLaravel<T>(
  path: string,
  {
    body,
    method = "GET",
    token
  }: {
    body?: unknown;
    method?: "GET" | "POST";
    token?: string;
  } = {}
): Promise<T> {
  const response = await fetch(`${LARAVEL_API_URL}${path}`, {
    method,
    headers: {
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    cache: "no-store"
  });

  const payload = (await response.json().catch(() => null)) as LaravelErrorPayload | T | null;

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
    body: { email, password }
  });
}

export async function getAdminProfile(token: string) {
  const response = await callLaravel<AdminProfileResponse>("/admin/me", {
    token
  });

  return response.user;
}

export function getAdminDashboard(token: string) {
  return callLaravel<AdminDashboardPayload>("/admin/dashboard", {
    token
  });
}

export function logoutAdmin(token: string) {
  return callLaravel<{ message: string }>("/admin/logout", {
    method: "POST",
    token
  });
}
