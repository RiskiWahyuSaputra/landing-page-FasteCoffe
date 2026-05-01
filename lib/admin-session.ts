import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ADMIN_AUTH_COOKIE } from "@/lib/admin-auth";
import { getAdminProfile, type AdminUser } from "@/lib/laravel-admin-api";

export async function requireAdminSession(): Promise<{
  token: string;
  user: AdminUser;
}> {
  const token = cookies().get(ADMIN_AUTH_COOKIE)?.value;

  if (!token) {
    redirect("/admin/login");
  }

  try {
    const user = await getAdminProfile(token);
    return { token, user };
  } catch {
    redirect("/admin/login");
  }
}
