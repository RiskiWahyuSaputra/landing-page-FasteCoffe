<?php

namespace App\Events\Concerns;

use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Support\Facades\Storage;

trait SerializesOrderPayload
{
    /**
     * @return array<string, mixed>
     */
    protected function serializeOrderPayload(Order $order): array
    {
        $order->loadMissing('items');

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
