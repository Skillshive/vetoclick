<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $jsonPath = database_path('data/users.json');
        
        if (!File::exists($jsonPath)) {
            $this->command->error("users JSON file not found at: {$jsonPath}");
            return;
        }

        $users = json_decode(File::get($jsonPath), true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            $this->command->error("Invalid JSON in users file: " . json_last_error_msg());
            return;
        }

            foreach ($users as $user) {
                $createdUser = User::create(
                    [
                        'password' => $user["password"],
                        'firstname' => $user["firstname"],
                        'lastname' => $user["lastname"],
                        'phone' => $user["phone"],
                        'image_id' => $user["image_id"],
                        'email' => $user["email"]
                    ]
                );

                // Assign a random role to each user (excluding admin)
                $roles = ['veterinarian', 'receptionist'];
                $randomRole = $roles[array_rand($roles)];
                $createdUser->assignRole($randomRole);
            }

        $this->command->info("users seeded successfully!");
    }
}
