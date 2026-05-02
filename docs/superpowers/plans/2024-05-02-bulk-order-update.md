# Bulk Order Status Update Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a bulk order status update feature for the admin panel.

**Architecture:** Use a client component to select a status and send order IDs to a Next.js API route, which proxies the request to the Laravel backend via a central API utility.

**Tech Stack:** Next.js (App Router), TypeScript, Laravel.

---

### Task 1: Backend Route and Controller

**Files:**
- Modify: `backend/routes/api.php`
- Modify: `backend/app/Http/Controllers/Api/OrderController.php`

- [ ] **Step 1: Add the route to `api.php`**
```php
// backend/routes/api.php
Route::post('/orders/bulk-status', [OrderController::class, 'bulkUpdateStatus']);
```

- [ ] **Step 2: Implement `bulkUpdateStatus` in `OrderController.php`**
```php
// backend/app/Http/Controllers/Api/OrderController.php
public function bulkUpdateStatus(Request $request): JsonResponse
{
    $data = $request->validate([
        'ids' => ['required', 'array', 'min:1'],
        'ids.*' => ['exists:orders,id'],
        'status' => ['required', 'string', 'in:received,brewing,ready_for_pickup'],
    ]);

    Order::whereIn('id', $data['ids'])->update(['status' => $data['status']]);

    return response()->json([
        'message' => 'Status pesanan berhasil diperbarui secara massal.',
    ]);
}
```

- [ ] **Step 3: Commit**
```bash
git add backend/routes/api.php backend/app/Http/Controllers/Api/OrderController.php
git commit -m "feat(backend): add bulk order status update endpoint"
```

---

### Task 2: Frontend API Utility

**Files:**
- Modify: `lib/laravel-admin-api.ts`

- [ ] **Step 1: Add `bulkUpdateOrderStatus` function**
```typescript
// lib/laravel-admin-api.ts
export function bulkUpdateOrderStatus(token: string, ids: number[], status: string) {
  return callLaravel<{ message: string }>("/admin/orders/bulk-status", {
    method: "POST",
    token,
    body: { ids, status },
  });
}
```

- [ ] **Step 2: Commit**
```bash
git add lib/laravel-admin-api.ts
git commit -m "feat(api): add bulkUpdateOrderStatus utility"
```

---

### Task 3: Next.js API Route

**Files:**
- Create: `app/api/admin/orders/bulk-status/route.ts`

- [ ] **Step 1: Implement the API route**
```typescript
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_AUTH_COOKIE } from "@/lib/admin-auth";
import { LaravelApiError, bulkUpdateOrderStatus } from "@/lib/laravel-admin-api";

export async function POST(request: Request) {
  const token = cookies().get(ADMIN_AUTH_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    ids?: number[];
    status?: string;
  } | null;

  if (!body?.ids || !Array.isArray(body.ids) || body.ids.length === 0 || !body.status) {
    return NextResponse.json({ message: "Data tidak valid." }, { status: 400 });
  }

  try {
    const response = await bulkUpdateOrderStatus(token, body.ids, body.status);
    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof LaravelApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    return NextResponse.json({ message: "Gagal memperbarui status order." }, { status: 500 });
  }
}
```

- [ ] **Step 2: Commit**
```bash
git add app/api/admin/orders/bulk-status/route.ts
git commit -m "feat(api-route): add bulk status proxy route"
```

---

### Task 4: UI Component

**Files:**
- Create: `components/admin/BulkStatusUpdate.tsx`

- [ ] **Step 1: Implement the `BulkStatusUpdate` component**
```tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ORDER_STATUSES, getOrderStatusLabel } from "@/lib/order-status";

export default function BulkStatusUpdate({ ids }: { ids: number[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState(ORDER_STATUSES[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleBulkUpdate = async () => {
    if (ids.length === 0) return;
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/orders/bulk-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, status }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Gagal memperbarui status.");
      }

      setMessage(data.message);
      startTransition(() => {
        router.refresh();
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-[1.4rem] border border-white/10 bg-white/[0.02] p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.22em] text-sand/45">Bulk Actions ({ids.length} selected)</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
          className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs text-cream outline-none focus:border-copper/50"
        >
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>{getOrderStatusLabel(s)}</option>
          ))}
        </select>
        <button
          onClick={handleBulkUpdate}
          disabled={loading || ids.length === 0}
          className="rounded-full bg-copper px-6 py-2 text-xs font-bold uppercase tracking-[0.1em] text-black transition hover:bg-copper/80 disabled:opacity-50"
        >
          {loading ? "Updating..." : "Update Status"}
        </button>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      {message && <p className="text-xs text-green-400">{message}</p>}
    </div>
  );
}
```

- [ ] **Step 2: Commit**
```bash
git add components/admin/BulkStatusUpdate.tsx
git commit -m "feat(ui): add BulkStatusUpdate component"
```
