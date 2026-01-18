<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Veterinary;
use Spatie\Permission\Models\Role;
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

        $vet = User::create(
            ['firstname' => 'Jhon',
            'lastname' => 'Doe',
            'email' => 'admin@gmail.com',
            'password' => bcrypt('Password1234!234'),
        ]
        );
        $user = User::create(
            ['firstname' => 'Abdellah',
            'lastname' => 'Bounafaa',
            'email' => 'abdellahbounafaa@gmail.com',
            'password' => bcrypt('Password1234!234'),
        ]
        );

        // First, seed roles and permissions
        $this->call([
            RolePermissionSeeder::class, // Add our comprehensive role and permission seeder
        ]);

        Veterinary::create([
            'license_number' => 'VET123456',
            'specialization' => 'General Veterinary',
            'years_experience' => 5,
            'profile_img' => null,
            'user_id' => $vet->id,
        ]);

        // Assign veterinarian role to the user
        $vet->assignRole('veterinarian');
        $user->assignRole('admin');

        // Seed other data
        $this->call([
            UserSeeder::class,
            SpeciesSeeder::class,
            BreedSeeder::class,
            SupplierSeeder::class,
            ProductCategorySeeder::class,
            ProductSeeder::class,
            CategoryBlogSeeder::class,
            BlogSeeder::class,
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
