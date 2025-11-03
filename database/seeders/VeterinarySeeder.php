<?php

namespace Database\Seeders;

use App\Models\Veterinary;
use Illuminate\Database\Seeder;

class VeterinarySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Veterinary::factory()->count(10)->create();
    }
}
