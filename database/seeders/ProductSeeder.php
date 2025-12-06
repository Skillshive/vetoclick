<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $jsonPath = database_path('data/products.json');

        if (!File::exists($jsonPath)) {
            $this->command->error("Products JSON file not found at: {$jsonPath}");
            return;
        }

        $products = json_decode(File::get($jsonPath), true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            $this->command->error("Invalid JSON in products file: " . json_last_error_msg());
            return;
        }

        $this->command->info("Seeding products...");

        foreach ($products as $productData) {
            $category = ProductCategory::where('name', $productData['category_name'])->first();

            if (!$category) {
                $this->command->warn("Category '{$productData['category_name']}' not found for product '{$productData['name']}'. Skipping.");
                continue;
            }

            Product::create([
                'uuid' => Str::uuid(),
                'name' => $productData['name'],
                'brand' => $productData['brand'],
                'description' => $productData['description'],
                'sku' => $productData['sku'],
                'barcode' => $productData['barcode'],
                'category_product_id' => $category->id,
                'type' => $productData['type'],
                'dosage_form' => $productData['dosage_form'],
                'target_species' => json_encode($productData['target_species']),
                'administration_route' => $productData['administration_route'],
                'prescription_required' => $productData['prescription_required'],
                'minimum_stock_level' => $productData['minimum_stock_level'],
                'maximum_stock_level' => $productData['maximum_stock_level'],
                'is_active' => $productData['is_active'],
                'availability_status' => $productData['availability_status'],
                'notes' => $productData['notes'],
                'veterinarian_id' =>1,
            ]);
        }

        $this->command->info("Products seeded successfully!");
    }
}
