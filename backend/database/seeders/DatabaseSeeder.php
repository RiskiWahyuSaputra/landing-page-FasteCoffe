<?php

namespace Database\Seeders;

use App\Models\MenuItem;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::query()->updateOrCreate(
            ['email' => 'admin@fastecoffee.test'],
            [
                'name' => 'Faste Coffee Admin',
                'password' => 'Admin12345!',
                'is_admin' => true,
            ],
        );

        $menuItems = [
            [
                'name' => 'Faste Signature',
                'description' => 'Strong and bold classic shot',
                'category' => 'coffee',
                'price' => 13000,
                'accent' => 'from-[#6a3c20] via-[#2f190f] to-[#140b08]',
            ],
            [
                'name' => 'Saka',
                'description' => 'Perfect balance of coffee and milk foam',
                'category' => 'coffee',
                'price' => 18000,
                'accent' => 'from-[#c58b56] via-[#5f341f] to-[#160c08]',
            ],
            [
                'name' => 'Latte',
                'description' => 'Smooth and creamy coffee',
                'category' => 'coffee',
                'price' => 18000,
                'accent' => 'from-[#dbc0a1] via-[#7b5638] to-[#120a07]',
            ],
            [
                'name' => 'Americano',
                'description' => 'Light and rich flavor',
                'category' => 'coffee',
                'price' => 15000,
                'accent' => 'from-[#8f5834] via-[#2a1810] to-[#120a07]',
            ],
            [
                'name' => 'Caramel Macchiato',
                'description' => 'Sweet, creamy, and indulgent',
                'category' => 'coffee',
                'price' => 20000,
                'accent' => 'from-[#efbc7e] via-[#87502b] to-[#170d08]',
            ],
        ];

        foreach ($menuItems as $index => $item) {
            MenuItem::query()->updateOrCreate(
                ['name' => $item['name']],
                [
                    ...$item,
                    'is_active' => true,
                    'sort_order' => $index + 1,
                ],
            );
        }
    }
}
