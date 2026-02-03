<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Veterinary;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $vet = User::create(
            ['firstname' => 'Veterinarian',
            'lastname' => 'Veterinarian',
            'email' => 'veterinarian@gmail.com',
            'password' => bcrypt('Password1234!234'),
        ]
        );
        $admin = User::create(
            ['firstname' => 'Admin',
            'lastname' => 'Admin',
            'email' => 'admin@gmail.com',
            'password' => bcrypt('Password1234!234'),
        ]
        );

        $this->call([
            RolePermissionSeeder::class, 
        ]);

        Veterinary::create([
            'license_number' => 'VET123456',
            'specialization' => 'General Veterinary',
            'years_experience' => 5,
            'profile_img' => null,
            'user_id' => $vet->id,
        ]);

        $vet->assignRole('veterinarian');
        $admin->assignRole('admin');

        $this->call([
            UserSeeder::class,
            SpeciesSeeder::class,
            BreedSeeder::class,
            SupplierSeeder::class,
            ProductCategorySeeder::class,
            ProductSeeder::class,
            CategoryBlogSeeder::class,
           // BlogSeeder::class,
            FeatureGroupSeeder::class,
            SubscriptionPlanSeeder::class,
            ClientSeeder::class,
            PetSeeder::class,
            VeterinarySeeder::class,
            AppointmentSeeder::class,
            MoroccoHolidaySeeder::class,
        ]);
    }
}
