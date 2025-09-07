<?php

namespace Database\Seeders;

use App\Models\Breed;
use App\Models\Species;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class BreedSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $jsonPath = database_path('data/breeds.json');
        
        if (!File::exists($jsonPath)) {
            $this->command->error("Breeds JSON file not found at: {$jsonPath}");
            return;
        }

        $breedsData = json_decode(File::get($jsonPath), true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            $this->command->error("Invalid JSON in breeds file: " . json_last_error_msg());
            return;
        }

        $totalBreeds = array_sum(array_map('count', $breedsData));
        $this->command->info("Seeding {$totalBreeds} breeds across " . count($breedsData) . " species...");

        foreach ($breedsData as $speciesName => $breeds) {
            $species = Species::where('name', $speciesName)->first();
            
            if (!$species) {
                $this->command->warn("Species '{$speciesName}' not found. Skipping all breeds for this species...");
                continue;
            }

            foreach ($breeds as $breedData) {
                Breed::updateOrCreate(
                    [
                        'breed_name' => $breedData['breed_name'],
                        'species_id' => $species->id
                    ],
                    [
                        'uuid' => Str::uuid(),
                        'species_id' => $species->id,
                        'breed_name' => $breedData['breed_name'],
                        'avg_weight_kg' => $breedData['avg_weight_kg'],
                        'life_span_years' => $breedData['life_span_years'],
                    ]
                );
            }
        }

        $this->command->info("Breeds seeded successfully!");
    }
}
