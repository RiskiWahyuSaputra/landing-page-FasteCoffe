<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MenuItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MenuItemController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'items' => MenuItem::query()
                ->where('is_active', true)
                ->ordered()
                ->get()
                ->map(fn (MenuItem $item): array => $this->serializeMenuItem($item))
                ->all(),
        ]);
    }

    public function adminIndex(): JsonResponse
    {
        return response()->json([
            'items' => MenuItem::query()
                ->ordered()
                ->get()
                ->map(fn (MenuItem $item): array => $this->serializeMenuItem($item))
                ->all(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:500'],
            'price' => ['required', 'integer', 'min:1000'],
            'accent' => ['required', 'string', 'max:255'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $menuItem = MenuItem::query()->create([
            'name' => $data['name'],
            'description' => $data['description'],
            'price' => $data['price'],
            'accent' => $data['accent'],
            'is_active' => $data['is_active'] ?? true,
            'sort_order' => (MenuItem::query()->max('sort_order') ?? 0) + 1,
        ]);

        return response()->json([
            'message' => 'Menu berhasil ditambahkan.',
            'item' => $this->serializeMenuItem($menuItem),
        ], 201);
    }

    public function destroy(MenuItem $menuItem): JsonResponse
    {
        $menuItem->delete();

        return response()->json([
            'message' => 'Menu berhasil dihapus.',
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    protected function serializeMenuItem(MenuItem $item): array
    {
        return [
            'id' => $item->id,
            'name' => $item->name,
            'description' => $item->description,
            'price' => $item->price,
            'formatted_price' => 'Rp. ' . number_format($item->price, 0, ',', '.'),
            'accent' => $item->accent,
            'is_active' => (bool) $item->is_active,
            'sort_order' => $item->sort_order,
            'created_at' => $item->created_at?->toIso8601String(),
        ];
    }
}
