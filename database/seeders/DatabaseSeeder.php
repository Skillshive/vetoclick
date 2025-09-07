<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Veterinary;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        $user= User::create(
            ['firstname'=>'Jhon',
            'lastname'=>'Doe',
            'email' => 'admin@gmail.com',
            'password' => bcrypt('Password1234!'),
        ]
        );

        Veterinary::create([
            'license_number' => 'VET123456',
            'specialization' => 'General Veterinary',
            'years_experience' => 5,
            'profile_img' => null,
            'user_id' => $user->id,
        ]);
        // Seed species and breeds from JSON files
        $this->call([
            SpeciesSeeder::class,
            BreedSeeder::class,
            SupplierSeeder::class,
            ProductCategorySeeder::class,
            ProductSeeder::class,
        ]);
    }
}
