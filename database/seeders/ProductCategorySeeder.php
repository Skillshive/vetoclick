<?php

namespace Database\Seeders;

use App\Models\ProductCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class ProductCategorySeeder extends Seeder
{
    public function run(): void
    {
        $jsonPath = database_path('data/product_categories.json');

        if (!File::exists($jsonPath)) {
            $this->command->error("Product categories JSON file not found at: {$jsonPath}");
            return;
        }

        $categories = json_decode(File::get($jsonPath), true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            $this->command->error("Invalid JSON in product categories file: " . json_last_error_msg());
            return;
        }

        $this->command->info("Seeding product categories...");

        foreach ($categories as $categoryData) {
            $this->createCategory($categoryData);
        }

        $this->command->info("Product categories seeded successfully!");
    }

    private function createCategory(array $categoryData, ?int $parentId = null): void
    {
        $category = ProductCategory::create([
            'uuid' => Str::uuid(),
            'name' => $categoryData['name'],
            'description' => $categoryData['description'],
            'category_product_id' => $parentId,
        ]);

        if (isset($categoryData['children'])) {
            foreach ($categoryData['children'] as $childData) {
                $this->createCategory($childData, $category->id);
            }
        }
    }
}
