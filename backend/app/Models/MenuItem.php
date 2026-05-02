<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class MenuItem extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'description',
        'category',
        'price',
        'accent',
        'image_path',
        'is_active',
        'sort_order',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'price' => 'integer',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function scopeOrdered(Builder $query): void
    {
        $query
            ->orderBy('sort_order')
            ->orderBy('name');
    }
}
