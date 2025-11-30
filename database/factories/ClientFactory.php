<?php

namespace Database\Factories;

use App\Models\Veterinary;
use App\Models\Pet;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Client>
 */
class ClientFactory extends Factory
{
    /**
     * Track if pets should be created (default: true)
     */
    protected bool $shouldCreatePets = true;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'veterinarian_id' => Veterinary::factory(),
            'first_name' => $this->faker->firstName(),
            'last_name' => $this->faker->lastName(),
            'email' => $this->faker->unique()->safeEmail(),
            'phone' => $this->faker->phoneNumber(),
            'fixe' => $this->faker->phoneNumber(),
            'address' => $this->faker->address(),
            'city' => $this->faker->city(),
            'postal_code' => $this->faker->postcode(),
        ];
    }

    /**
     * Configure the factory to automatically create pets for clients.
     *
     * @return $this
     */
    public function configure(): static
    {
        return $this->afterCreating(function ($client) {
            if ($this->shouldCreatePets) {
                // By default, create 1-3 pets for each client
                $petCount = $this->faker->numberBetween(1, 3);
                Pet::factory()->count($petCount)->create([
                    'client_id' => $client->id,
                ]);
            }
        });
    }

    /**
     * Indicate that the client should have a specific number of pets.
     *
     * @param int $count Number of pets to create.
     * @return $this
     */
    public function withPets(int $count): static
    {
        $this->shouldCreatePets = true;
        return $this->afterCreating(function ($client) use ($count) {
            Pet::factory()->count($count)->create([
                'client_id' => $client->id,
            ]);
        });
    }

    /**
     * Indicate that the client should not have pets.
     *
     * @return $this
     */
    public function withoutPets(): static
    {
        $this->shouldCreatePets = false;
        return $this;
    }
}
