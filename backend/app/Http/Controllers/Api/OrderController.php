<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'customer_name' => ['required', 'string', 'max:255'],
            'customer_phone' => ['required', 'string', 'max:32'],
            'pickup_note' => ['nullable', 'string', 'max:1000'],
            'payment_method' => ['required', 'string', 'in:qris,bank_transfer,cash_on_pickup,e_wallet'],
            'payment_proof' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'service_fee' => ['nullable', 'integer', 'min:0'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.name' => ['required', 'string', 'max:255'],
            'items.*.description' => ['required', 'string', 'max:500'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.numeric_price' => ['required', 'integer', 'min:1000'],
            'items.*.image_url' => ['nullable', 'string', 'max:2048'],
        ]);

        $subtotal = collect($data['items'])->sum(
            fn (array $item): int => $item['numeric_price'] * $item['quantity']
        );
        $serviceFee = $data['service_fee'] ?? 0;
        $total = $subtotal + $serviceFee;

        if ($subtotal <= 0 || $total <= 0) {
            throw ValidationException::withMessages([
                'items' => ['Total pembelian tidak valid.'],
            ]);
        }

        if (($data['payment_method'] ?? null) !== 'cash_on_pickup' && !$request->hasFile('payment_proof')) {
            throw ValidationException::withMessages([
                'payment_proof' => ['Upload bukti pembayaran untuk metode yang dipilih.'],
            ]);
        }

        $paymentProofPath = $request->file('payment_proof')?->store('payment-proofs', 'public');

        $order = DB::transaction(function () use ($data, $serviceFee, $subtotal, $total, $paymentProofPath): Order {
            $order = Order::query()->create([
                'order_number' => 'FC-' . now()->format('Ymd') . '-' . Str::upper(Str::random(6)),
                'customer_name' => $data['customer_name'],
                'customer_phone' => $data['customer_phone'],
                'pickup_note' => $data['pickup_note'] ?? null,
                'payment_method' => $data['payment_method'],
                'payment_proof_path' => $paymentProofPath,
                'status' => 'received',
                'subtotal' => $subtotal,
                'service_fee' => $serviceFee,
                'total' => $total,
                'placed_at' => now(),
            ]);

            foreach ($data['items'] as $item) {
                $menuItemId = MenuItem::query()->where('name', $item['name'])->value('id');

                OrderItem::query()->create([
                    'order_id' => $order->id,
                    'menu_item_id' => $menuItemId,
                    'name' => $item['name'],
                    'unit_price' => $item['numeric_price'],
                    'quantity' => $item['quantity'],
                    'line_total' => $item['numeric_price'] * $item['quantity'],
                    'image_url' => $item['image_url'] ?? null,
                ]);
            }

            return $order->load('items');
        });

        return response()->json([
            'message' => 'Pesanan berhasil dibuat.',
            'order' => $this->serializeOrder($order),
        ], 201);
    }

    public function updateStatus(Request $request, Order $order): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', 'string', 'in:received,brewing,ready_for_pickup'],
        ]);

        $order->forceFill([
            'status' => $data['status'],
        ])->save();

        return response()->json([
            'message' => 'Status pesanan berhasil diperbarui.',
            'order' => $this->serializeOrder($order->fresh('items')),
        ]);
    }

    public function adminIndex(Request $request): JsonResponse
    {
        $filter = $request->query('filter', 'today');
        $ordersQuery = Order::query()->with('items')->latest('placed_at');

        if ($filter === 'today') {
            $ordersQuery->whereDate('placed_at', today());
        } elseif ($filter === 'last_month') {
            $start = now()->subMonthNoOverflow()->startOfMonth();
            $end = now()->subMonthNoOverflow()->endOfMonth();
            $ordersQuery->whereBetween('placed_at', [$start, $end]);
        } elseif ($filter === 'last_year') {
            $start = Carbon::create(now()->year - 1, 1, 1)->startOfDay();
            $end = Carbon::create(now()->year - 1, 12, 31)->endOfDay();
            $ordersQuery->whereBetween('placed_at', [$start, $end]);
        }

        $orders = $ordersQuery->get();

        return response()->json([
            'filter' => $filter,
            'summary' => [
                'count' => $orders->count(),
                'revenue' => $orders->sum('total'),
            ],
            'orders' => $orders->map(fn (Order $order): array => $this->serializeOrder($order))->all(),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    protected function serializeOrder(Order $order): array
    {
        return [
            'id' => $order->id,
            'order_number' => $order->order_number,
            'customer_name' => $order->customer_name,
            'customer_phone' => $order->customer_phone,
            'pickup_note' => $order->pickup_note,
            'payment_method' => $order->payment_method,
            'payment_proof_url' => $order->payment_proof_path
                ? url(Storage::disk('public')->url($order->payment_proof_path))
                : null,
            'status' => $order->status ?? 'received',
            'subtotal' => $order->subtotal,
            'service_fee' => $order->service_fee,
            'total' => $order->total,
            'formatted_total' => 'Rp. ' . number_format($order->total, 0, ',', '.'),
            'placed_at' => $order->placed_at?->toIso8601String(),
            'items' => $order->items->map(fn (OrderItem $item): array => [
                'id' => $item->id,
                'name' => $item->name,
                'unit_price' => $item->unit_price,
                'quantity' => $item->quantity,
                'line_total' => $item->line_total,
                'image_url' => $item->image_url,
            ])->all(),
        ];
    }
}
