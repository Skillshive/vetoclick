<?php

namespace Database\Factories;

use App\Models\Breed;
use App\Models\Species;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Breed>
 */
class BreedFactory extends Factory
{
    protected $model = Breed::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'uuid' => Str::uuid(),
            'species_id' => Species::factory(),
            'breed_name' => $this->faker->words(2, true),
            'avg_weight_kg' => $this->faker->randomFloat(2, 0.5, 800),
            'life_span_years' => $this->faker->numberBetween(5, 30),
            'common_health_issues' => $this->faker->sentence(8),
        ];
    }
}
