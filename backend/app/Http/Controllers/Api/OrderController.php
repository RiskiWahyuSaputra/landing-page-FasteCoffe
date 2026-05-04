<?php

namespace App\Http\Controllers\Api;

use App\Events\OrderCreated;
use App\Events\OrderStatusUpdated;
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

        try {
            broadcast(new OrderCreated($order->fresh('items')));
        } catch (\Throwable $exception) {
            report($exception);
        }

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

        try {
            broadcast(new OrderStatusUpdated($order->fresh('items')));
        } catch (\Throwable $exception) {
            report($exception);
        }

        return response()->json([
            'message' => 'Status pesanan berhasil diperbarui.',
            'order' => $this->serializeOrder($order->fresh('items')),
        ]);
    }

public function destroyPaymentProof(Order $order): JsonResponse
    {
        if ($order->payment_proof_path) {
            Storage::disk('public')->delete($order->payment_proof_path);
        }

        $order->forceFill([
            'payment_proof_path' => null,
        ])->save();

        return response()->json([
            'message' => 'Bukti pembayaran berhasil dihapus.',
            'order' => $this->serializeOrder($order->fresh('items')),
        ]);
    }

    public function show(Order $order): JsonResponse
    {
        return response()->json($this->serializeOrder($order->load('items')));
    }

    public function adminIndex(Request $request): JsonResponse
    {
        $filter = $request->query('filter', 'today');
        $ordersQuery = Order::query()->with('items')->latest('placed_at');

        if ($filter === 'all') {
            // Show every order without date restriction.
        } elseif ($filter === 'today') {
            $ordersQuery->whereDate('placed_at', today());
        } elseif ($filter === 'yesterday') {
            $ordersQuery->whereDate('placed_at', today()->subDay());
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

    public function exportOrders(Request $request): \Illuminate\Http\Response
    {
        $filter = $request->query('filter', 'today');
        $ordersQuery = Order::query()->with('items')->latest('placed_at');

        if ($filter === 'all') {
            // No date restriction
        } elseif ($filter === 'today') {
            $ordersQuery->whereDate('placed_at', today());
        } elseif ($filter === 'yesterday') {
            $ordersQuery->whereDate('placed_at', today()->subDay());
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

        $filename = 'laporan-pesanan-' . $filter . '-' . now()->format('Y-m-d') . '.xls';

        // Generate HTML table for Excel with basic styling (Borders and Colors)
        $html = '
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
            <style>
                .table-header { background-color: #D2691E; color: #FFFFFF; font-weight: bold; text-align: center; }
                .cell { border: 0.5pt solid #000000; padding: 5px; }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .money { mso-number-format: "\"\Rp\"\#\,\#\#0"; }
            </style>
        </head>
        <body>
            <table border="1">
                <thead>
                    <tr>
                        <th class="cell table-header">ID Pesanan</th>
                        <th class="cell table-header">Pelanggan</th>
                        <th class="cell table-header">Telepon</th>
                        <th class="cell table-header">Metode</th>
                        <th class="cell table-header">Status</th>
                        <th class="cell table-header">Subtotal</th>
                        <th class="cell table-header">Biaya</th>
                        <th class="cell table-header">Total</th>
                        <th class="cell table-header">Tanggal</th>
                    </tr>
                </thead>
                <tbody>';

        foreach ($orders as $order) {
            $html .= '
                    <tr>
                        <td class="cell">' . $order->order_number . '</td>
                        <td class="cell">' . $order->customer_name . '</td>
                        <td class="cell">' . $order->customer_phone . '</td>
                        <td class="cell text-center">' . strtoupper($order->payment_method) . '</td>
                        <td class="cell text-center">' . strtoupper($order->status) . '</td>
                        <td class="cell text-right money">' . $order->subtotal . '</td>
                        <td class="cell text-right money">' . $order->service_fee . '</td>
                        <td class="cell text-right money">' . $order->total . '</td>
                        <td class="cell">' . ($order->placed_at ? $order->placed_at->format('Y-m-d H:i') : '-') . '</td>
                    </tr>';
        }

        $html .= '
                </tbody>
            </table>
        </body>
        </html>';

        return response($html, 200)
            ->header('Content-Type', 'application/vnd.ms-excel')
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
    }

    public function exportPdf(Request $request): \Illuminate\Http\Response
    {
        $filter = $request->query('filter', 'today');
        $ordersQuery = Order::query()->with('items')->latest('placed_at');

        if ($filter === 'all') {
            // No date restriction
        } elseif ($filter === 'today') {
            $ordersQuery->whereDate('placed_at', today());
        } elseif ($filter === 'yesterday') {
            $ordersQuery->whereDate('placed_at', today()->subDay());
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
        $totalRevenue = $orders->sum('total');

        $html = '
        <!DOCTYPE html>
        <html lang="id">
        <head>
            <meta charset="UTF-8">
            <title>Laporan Keuangan Faste Coffee</title>
            <style>
                body { font-family: sans-serif; color: #333; line-height: 1.6; padding: 20px; }
                .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #22c55e; padding-bottom: 10px; }
                .header h1 { color: #22c55e; margin: 0; }
                .header p { margin: 5px 0; color: #666; }
                .summary { margin-bottom: 20px; background: #f0fdf4; padding: 15px; border-radius: 8px; border-left: 4px solid #22c55e; }
                .summary table { width: 100%; border: none; }
                .summary td { border: none; padding: 5px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                th { background-color: #f0fdf4; color: #166534; font-weight: bold; text-align: left; }
                th, td { border: 1px solid #d1fae5; padding: 8px; font-size: 11px; }
                .text-right { text-align: right; }
                .footer { margin-top: 50px; text-align: right; font-size: 12px; color: #166534; }
                @media print {
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>FASTE COFFEE</h1>
                <p>Laporan Transaksi Keuangan - ' . strtoupper(str_replace('_', ' ', $filter)) . '</p>
                <p>Dicetak pada: ' . now()->format('d/m/Y H:i') . '</p>
            </div>

            <div class="summary">
                <table>
                    <tr>
                        <td><strong>Total Transaksi:</strong> ' . $orders->count() . ' Pesanan</td>
                        <td class="text-right"><strong>Total Pendapatan:</strong> Rp ' . number_format($totalRevenue, 0, ',', '.') . '</td>
                    </tr>
                </table>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>ID Pesanan</th>
                        <th>Pelanggan</th>
                        <th>Metode</th>
                        <th>Status</th>
                        <th class="text-right">Total</th>
                        <th>Tanggal</th>
                    </tr>
                </thead>
                <tbody>';

        foreach ($orders as $order) {
            $html .= '
                    <tr>
                        <td>' . $order->order_number . '</td>
                        <td>' . $order->customer_name . ' (' . $order->customer_phone . ')</td>
                        <td>' . strtoupper($order->payment_method) . '</td>
                        <td>' . strtoupper($order->status) . '</td>
                        <td class="text-right">Rp ' . number_format($order->total, 0, ',', '.') . '</td>
                        <td>' . ($order->placed_at ? $order->placed_at->format('d/m/Y H:i') : '-') . '</td>
                    </tr>';
        }

        $html .= '
                </tbody>
            </table>

            <div class="footer">
                <p>Manajemen Faste Coffee</p>
                <br><br><br>
                <p>(__________________________)</p>
            </div>

            <script class="no-print">
                window.onload = function() { 
                    window.print();
                    // Close the window after print dialog is closed (optional)
                    // window.onafterprint = function() { window.close(); }
                }
            </script>
        </body>
        </html>';

        return response($html, 200)
            ->header('Content-Type', 'text/html');
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
