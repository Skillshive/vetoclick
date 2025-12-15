<?php

namespace Database\Factories;

use App\Models\Appointment;
use App\Models\Client;
use App\Models\Pet;
use App\Models\Veterinary;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Appointment>
 */
class AppointmentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startTime = $this->faker->time('H:i:s');
        $duration = $this->faker->randomElement([30, 60, 90]);
        $endTime = date('H:i:s', strtotime($startTime) + $duration * 60);
        $isVideoConseil = $this->faker->boolean();

        return [
            'veterinarian_id' =>1,
      'client_id' => rand(1, 10),
'pet_id' => rand(1, 10),
            'appointment_type' => $this->faker->randomElement(['consultation', 'vaccination', 'checkup']),
            'appointment_date' => $this->faker->dateTimeBetween('now', '+1 week')->format('Y-m-d'),
            'start_time' => $startTime,
            'end_time' => $endTime,
            'duration_minutes' => $duration,
            'status' => $this->faker->randomElement(['scheduled', 'completed', 'cancelled']),
            'is_video_conseil' => $isVideoConseil,
            'video_meeting_id' => $isVideoConseil ? $this->faker->uuid() : null,
            'video_join_url' => $isVideoConseil ? $this->faker->url() : null,
            'reason_for_visit' => $this->faker->sentence(),
            'appointment_notes' => $this->faker->paragraph(),
        ];
    }
}
