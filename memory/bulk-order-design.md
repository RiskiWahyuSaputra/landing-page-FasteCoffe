# Design Spec: Bulk Order Status Update

## Purpose
Implement a feature allowing admins to update the status of multiple orders at once.

## Architecture
- **Frontend Utility**: `bulkUpdateOrderStatus` in `lib/laravel-admin-api.ts` using `callLaravel`.
- **API Proxy**: Next.js API route at `/api/admin/orders/bulk-status`.
- **UI Component**: `components/admin/BulkStatusUpdate.tsx` (Client Component).

## Data Flow
1. User selects multiple orders (handled by parent).
2. User selects status in `BulkStatusUpdate` and clicks "Update".
3. Component calls `POST /api/admin/orders/bulk-status`.
4. API route calls `bulkUpdateOrderStatus`.
5. `bulkUpdateOrderStatus` calls Laravel backend `/api/admin/orders/bulk-status`.

## Error Handling
- Follow `callLaravel` pattern: extract `Object.values(payload.errors)[0][0]` for validation errors.
- Component shows the error message in a styled alert box.

## Backend Requirements (Assumed)
- `POST /api/admin/orders/bulk-status`
- Payload: `{ ids: number[], status: string }`
- Returns: `{ message: string }`
