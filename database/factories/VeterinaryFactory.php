<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

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
        // Generate random coordinates only within Fes city area
        // Fes center: approximately 34.0331, -5.0003
        // Range: small radius around Fes to keep all vets in the city
        $latitude = $this->faker->randomFloat(6, 33.95, 34.10);  // Fes area
        $longitude = $this->faker->randomFloat(6, -5.10, -4.90);  // Fes area
        
        // Format address as "lat, lng" string (Morocco coordinates format)
        $address = sprintf('%.6f, %.6f', $latitude, $longitude);
        
        // Moroccan first names
        $moroccanFirstNames = [
            'Mohamed', 'Ahmed', 'Fatima', 'Khadija', 'Youssef', 'Ali', 'Hassan', 'Omar',
            'Amina', 'Zahra', 'Rachid', 'Said', 'Laila', 'Nadia', 'Hamza', 'Karim',
            'Samira', 'Hafsa', 'Salma', 'Zineb', 'Ayoub', 'Mehdi', 'Imane', 'Sanaa',
            'Abdelaziz', 'Driss', 'Latifa', 'Aziz', 'Houda', 'Ilham', 'Najat', 'Samir'
        ];
        
        // Moroccan last names
        $moroccanLastNames = [
            'El Amrani', 'Bennani', 'Alaoui', 'Idrissi', 'Berrada', 'Tazi', 'Fassi',
            'Iraqi', 'Filali', 'Mahmoudi', 'Sekkat', 'Benjelloun', 'El Mansouri',
            'Chraibi', 'Kettani', 'Squalli', 'Lahlou', 'Mekouar', 'Oudghiri',
            'Benchekroun', 'El Khalifi', 'Zniber', 'Benmoussa', 'El Gueddari'
        ];
        
        // Generate random Moroccan full name
        $firstName = $this->faker->randomElement($moroccanFirstNames);
        $lastName = $this->faker->randomElement($moroccanLastNames);
        
        // Moroccan clinic names
        $moroccanClinicNames = [
            'Clinique Vétérinaire Fès',
            'Cabinet Vétérinaire Atlas',
            'Clinique Vétérinaire Moulay Idriss',
            'Cabinet Vétérinaire Fès-Médina',
            'Clinique Vétérinaire Zouagha',
            'Cabinet Vétérinaire Sidi Brahim',
            'Clinique Vétérinaire Al Andalous',
            'Cabinet Vétérinaire Saïss',
            'Clinique Vétérinaire Bensouda',
            'Cabinet Vétérinaire Narjiss'
        ];
        
        // Specializations from the frontend
        $specializations = [
            'General Practice',
            'Surgery',
            'Emergency Care',
            'Dentistry',
            'Cardiology',
            'Dermatology',
            'Oncology',
            'Orthopedics',
            'Internal Medicine',
            'Exotic Animals',
        ];
        
        // Generate price in multiples of 10 between 100 and 500
        $priceRaw = $this->faker->numberBetween(10, 50); // 10 to 50
        $price = $priceRaw * 10; // 100, 110, 120... up to 500
        
        return [
            'user_id' => User::factory()->state([
                'firstname' => $firstName,
                'lastname' => $lastName,
            ]),
            'license_number' => $this->faker->unique()->numerify('VET######'),
            'specialization' => $this->faker->randomElement($specializations),
            'years_experience' => $this->faker->numberBetween(1, 30),
            'clinic_name' => $this->faker->randomElement($moroccanClinicNames),
            'profile_img' => null,
            'address' => $address,
            'consultation_price' => $price . '.00',
            'subscription_status' => $this->faker->randomElement(['active', 'inactive', 'suspended']),
            'subscription_start_date' => null,
            'subscription_end_date' => null,
            'city' => 'Fès',
        ];
    }
}
