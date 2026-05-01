<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MenuItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

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
        $data = $this->validateMenuItem($request);

        $menuItem = MenuItem::query()->create([
            'name' => $data['name'],
            'description' => $data['description'],
            'price' => $data['price'],
            'accent' => $data['accent'],
            'image_path' => $request->file('image')?->store('menu-items', 'public'),
            'is_active' => $data['is_active'] ?? true,
            'sort_order' => (MenuItem::query()->max('sort_order') ?? 0) + 1,
        ]);

        return response()->json([
            'message' => 'Menu berhasil ditambahkan.',
            'item' => $this->serializeMenuItem($menuItem),
        ], 201);
    }

    public function update(Request $request, MenuItem $menuItem): JsonResponse
    {
        $data = $this->validateMenuItem($request, $menuItem->id);
        $imagePath = $menuItem->image_path;

        if ($request->hasFile('image')) {
            if ($imagePath) {
                Storage::disk('public')->delete($imagePath);
            }

            $imagePath = $request->file('image')?->store('menu-items', 'public');
        }

        $menuItem->update([
            'name' => $data['name'],
            'description' => $data['description'],
            'price' => $data['price'],
            'accent' => $data['accent'],
            'image_path' => $imagePath,
            'is_active' => $data['is_active'] ?? true,
        ]);

        return response()->json([
            'message' => 'Menu berhasil diperbarui.',
            'item' => $this->serializeMenuItem($menuItem->fresh()),
        ]);
    }

    public function destroy(MenuItem $menuItem): JsonResponse
    {
        if ($menuItem->image_path) {
            Storage::disk('public')->delete($menuItem->image_path);
        }

        $menuItem->delete();

        return response()->json([
            'message' => 'Menu berhasil dihapus.',
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    protected function validateMenuItem(Request $request, ?int $menuItemId = null): array
    {
        return $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('menu_items', 'name')->ignore($menuItemId),
            ],
            'description' => ['required', 'string', 'max:500'],
            'price' => ['required', 'integer', 'min:1000'],
            'accent' => ['required', 'string', 'max:255'],
            'is_active' => ['nullable', 'boolean'],
            'image' => ['nullable', 'image', 'max:4096'],
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
            'image_url' => $item->image_path ? Storage::disk('public')->url($item->image_path) : null,
            'is_active' => (bool) $item->is_active,
            'sort_order' => $item->sort_order,
            'created_at' => $item->created_at?->toIso8601String(),
        ];
    }
}
