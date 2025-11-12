<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Veterinary>
 */
class VeterinaryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'uuid' => Str::uuid(),
            'user_id' => User::factory(),
            'license_number' => $this->faker->unique()->numerify('VET######'),
            'specialization' => $this->faker->words(2, true),
            'years_experience' => $this->faker->numberBetween(1, 30),
            'clinic_name' => $this->faker->company(),
            'profile_img' => null,
            'address' => $this->faker->address(),
            'subscription_status' => $this->faker->randomElement(['active', 'inactive', 'suspended']),
            'subscription_start_date' => null,
            'subscription_end_date' => null,
        ];
    }
}
