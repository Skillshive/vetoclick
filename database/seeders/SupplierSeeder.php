<?php

namespace Database\Seeders;

use App\Models\Supplier;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;

class SupplierSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $jsonPath = database_path('data/suppliers.json');
        
        if (!File::exists($jsonPath)) {
            $this->command->error("Suppliers JSON file not found at: {$jsonPath}");
            return;
        }

        $supplierData = json_decode(File::get($jsonPath), true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            $this->command->error("Invalid JSON in suppliers file: " . json_last_error_msg());
            return;
        }

        $this->command->info("Seeding " . count($supplierData) . " suppliers...");

        foreach ($supplierData as $supplier) {
            Supplier::updateOrCreate(
                ['name' => $supplier['name']],
                [
                    'address' => $supplier['address'],
                    'email' => $supplier['email'],
                    'phone' => $supplier['phone'],
                ]
            );
        }

        $this->command->info("Suppliers seeded successfully!");
    }
}
