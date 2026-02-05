<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductCategory;
use App\Enums\ProductType;
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
                // Create the category if it doesn't exist
                $this->command->info("Category '{$productData['category_name']}' not found. Creating it...");
                $category = ProductCategory::create([
                    'name' => $productData['category_name'],
                    'description' => "Category for {$productData['category_name']} products.",
                ]);
                $this->command->info("Category '{$productData['category_name']}' created successfully.");
            }

            // Determine product type - check if it's a vaccine by name or category
            $productType = $productData['type'] ?? ProductType::MEDICATION->value;
            
            // If type is not explicitly set, try to determine from name or category
            if (!isset($productData['type'])) {
                $nameLower = strtolower($productData['name']);
                $categoryLower = strtolower($productData['category_name'] ?? '');
                
                if (str_contains($nameLower, 'vaccine') || 
                    str_contains($nameLower, 'vaccination') ||
                    str_contains($categoryLower, 'vaccine') ||
                    str_contains($categoryLower, 'vaccination')) {
                    $productType = ProductType::VACCINE->value;
                }
            }
            
            // Ensure type is a valid ProductType value
            $productType = in_array($productType, [1, 2, 3, 4, 5]) ? $productType : ProductType::MEDICATION->value;

            Product::create([
                'uuid' => Str::uuid(),
                'name' => $productData['name'],
                'brand' => $productData['brand'] ?? null,
                'description' => $productData['description'] ?? null,
                'sku' => $productData['sku'],
                'barcode' => $productData['barcode'] ?? null,
                'category_product_id' => $category->id,
                'type' => $productType,
                'dosage_form' => $productData['dosage_form'] ?? null,
                'target_species' => isset($productData['target_species']) ? json_encode($productData['target_species']) : null,
                'administration_route' => $productData['administration_route'] ?? null,
                'prescription_required' => $productData['prescription_required'] ?? false,
                'minimum_stock_level' => $productData['minimum_stock_level'] ?? 0,
                'maximum_stock_level' => $productData['maximum_stock_level'] ?? null,
                'is_active' => $productData['is_active'] ?? true,
                'availability_status' => $productData['availability_status'] ?? 1,
                'notes' => $productData['notes'] ?? null,
                'vaccine_instructions' => $productData['vaccine_instructions'] ?? null,
                'veterinarian_id' => 1,
            ]);
        }

        $this->command->info("Products seeded successfully!");
    }
}
