<?php

namespace Database\Seeders;

use App\Models\Species;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class SpeciesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $jsonPath = database_path('data/species.json');
        
        if (!File::exists($jsonPath)) {
            $this->command->error("Species JSON file not found at: {$jsonPath}");
            return;
        }

        $speciesData = json_decode(File::get($jsonPath), true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            $this->command->error("Invalid JSON in species file: " . json_last_error_msg());
            return;
        }

        $this->command->info("Seeding " . count($speciesData) . " species...");

        foreach ($speciesData as $species) {
            Species::updateOrCreate(
                ['name' => $species['name']],
                [
                    'uuid' => Str::uuid(),
                    'name' => $species['name'],
                    'description' => $species['short_desc'],
                ]
            );
        }

        $this->command->info("Species seeded successfully!");
    }
}
