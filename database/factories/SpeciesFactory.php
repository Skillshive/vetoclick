<?php

namespace Database\Factories;

use App\Models\Species;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Species>
 */
class SpeciesFactory extends Factory
{
    protected $model = Species::class;

    /**
     * Get species data from JSON file
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

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $speciesData = $this->getSpeciesData();
        
        // If we have JSON data, use it; otherwise fall back to faker
        if (!empty($speciesData)) {
            $randomSpecies = $this->faker->randomElement($speciesData);
            
            return [
                'uuid' => Str::uuid(),
                'name' => $randomSpecies['name'] ?? $this->faker->word(),
                'description' => $randomSpecies['short_desc'] ?? $this->faker->sentence(10),
            ];
        }
        
        // Fallback to faker if JSON file doesn't exist or is empty
        return [
            'uuid' => Str::uuid(),
            'name' => $this->faker->word(),
            'description' => $this->faker->sentence(10),
        ];
    }
}
