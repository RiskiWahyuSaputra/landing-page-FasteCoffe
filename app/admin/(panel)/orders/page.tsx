import AdminOrdersRealtime from "@/components/admin/AdminOrdersRealtime";
import { requireAdminSession } from "@/lib/admin-session";
import { getAdminOrders } from "@/lib/laravel-admin-api";
import type { OrderStatus } from "@/lib/order-status";

const allowedStatuses: OrderStatus[] = [
  "received",
  "brewing",
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams?: { status?: string };
}) {
  const selectedStatus = allowedStatuses.includes(
    searchParams?.status as OrderStatus,
  )
    ? (searchParams?.status as OrderStatus)
    : "received";

  const { token } = await requireAdminSession();
  const data = await getAdminOrders(token, "all");

  return (
    <section className="flex min-h-[calc(100vh-2rem)] flex-col gap-5">
      <AdminOrdersRealtime
        initialOrders={data.orders}
        selectedStatus={selectedStatus}
      />
    </section>
  );
}
