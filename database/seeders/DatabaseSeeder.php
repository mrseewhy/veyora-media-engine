<?php

namespace Database\Seeders;

use App\Models\Brand;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        Brand::query()->firstOrCreate(
            ['slug' => 'toolpilot-daily'],
            ['name' => 'ToolPilot Daily', 'enabled' => true]
        );
    }
}
