import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ADMIN_AUTH_COOKIE } from "@/lib/admin-auth";
import { getAdminProfile } from "@/lib/laravel-admin-api";

export default async function AdminIndexPage() {
  const token = cookies().get(ADMIN_AUTH_COOKIE)?.value;

  if (token) {
    try {
      await getAdminProfile(token);
      redirect("/admin/dashboard");
    } catch {
      redirect("/admin/login");
    }
  }

  redirect("/admin/login");
}
