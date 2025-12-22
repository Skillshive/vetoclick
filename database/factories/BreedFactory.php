<?php

namespace Database\Factories;

use App\Models\Breed;
use App\Models\Species;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Breed>
 */
class BreedFactory extends Factory
{
    protected $model = Breed::class;

    /**
     * Get breeds data from JSON file
     *
     * @return array
     */
    protected function getBreedsData(): array
    {
        static $breedsData = null;
        
        if ($breedsData === null) {
            $jsonPath = database_path('data/breeds.json');
            
            if (File::exists($jsonPath)) {
                $data = json_decode(File::get($jsonPath), true);
                $breedsData = is_array($data) ? $data : [];
            } else {
                $breedsData = [];
            }
        }
        
        return $breedsData;
    }

    /**
     * Get a random breed and its species name from JSON
     *
     * @return array|null Returns ['species_name' => string, 'breed' => array] or null
     */
    protected function getRandomBreedWithSpecies(): ?array
    {
        $breedsData = $this->getBreedsData();
        
        if (empty($breedsData)) {
            return null;
        }
        
        // Pick a random species
        $speciesNames = array_keys($breedsData);
        if (empty($speciesNames)) {
            return null;
        }
        
        $randomSpeciesName = $this->faker->randomElement($speciesNames);
        $breeds = $breedsData[$randomSpeciesName];
        
        if (empty($breeds)) {
            return null;
        }
        
        $randomBreed = $this->faker->randomElement($breeds);
        
        return [
            'species_name' => $randomSpeciesName,
            'breed' => $randomBreed,
        ];
    }

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $breedsData = $this->getBreedsData();
        
        // If we have JSON data, use it
        if (!empty($breedsData)) {
            $breedData = $this->getRandomBreedWithSpecies();
            
            if ($breedData) {
                $speciesName = $breedData['species_name'];
                $breed = $breedData['breed'];
                
                // Get or create the species
                $species = Species::where('name', $speciesName)->first();
                
                if (!$species) {
                    // If species doesn't exist, try to create it from JSON
                    $speciesData = $this->getSpeciesData();
                    $speciesInfo = collect($speciesData)->firstWhere('name', $speciesName);
                    
                    if ($speciesInfo) {
                        $species = Species::updateOrCreate(
                            ['name' => $speciesInfo['name']],
                            [
                                'uuid' => Str::uuid(),
                                'name' => $speciesInfo['name'],
                                'description' => $speciesInfo['short_desc'] ?? '',
                            ]
                        );
                    } else {
                        // Fallback to factory if species not in JSON
                        $species = Species::factory()->create(['name' => $speciesName]);
                    }
                }
                
                return [
                    'uuid' => Str::uuid(),
                    'species_id' => $species->id,
                    'breed_name' => $breed['breed_name'],
                    'avg_weight_kg' => $breed['avg_weight_kg'] ?? $this->faker->randomFloat(2, 0.5, 800),
                    'life_span_years' => $breed['life_span_years'] ?? $this->faker->numberBetween(5, 30),
                ];
            }
        }
        
        // Fallback to faker if JSON file doesn't exist or is empty
        return [
            'uuid' => Str::uuid(),
            'species_id' => Species::factory(),
            'breed_name' => $this->faker->words(2, true),
            'avg_weight_kg' => $this->faker->randomFloat(2, 0.5, 800),
            'life_span_years' => $this->faker->numberBetween(5, 30),
        ];
    }
    
    /**
     * Get species data from JSON file (helper method)
     *
     * @return array
     */
    protected function getSpeciesData(): array
    {
        static $speciesData = null;
        
        if ($speciesData === null) {
            $jsonPath = database_path('data/species.json');
            
            if (File::exists($jsonPath)) {
                $data = json_decode(File::get($jsonPath), true);
                $speciesData = is_array($data) ? $data : [];
            } else {
                $speciesData = [];
            }
        }
        
        return $speciesData;
    }
}
