<?php

namespace Database\Factories;

use App\Models\Client;
use App\Models\Breed;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Pet>
 */
class PetFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'client_id' => Client::factory(),
            'name' => $this->faker->name(),
            'breed_id' => Breed::factory(),
            'sex' => $this->faker->randomElement([0,1]),
            'neutered_status' => $this->faker->boolean(),
            'dob' => $this->faker->date(),
            'microchip_ref' => $this->faker->numerify('################'),
            'profile_img' => null,
            'weight_kg' => $this->faker->randomFloat(2, 1, 50),
            'bcs' => $this->faker->numberBetween(1, 9),
            'color' => $this->faker->colorName(),
            'deceased_at' => null,
        ];
    }
}
