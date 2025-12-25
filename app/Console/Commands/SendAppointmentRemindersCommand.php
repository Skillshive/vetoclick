<?php

namespace App\Console\Commands;

use App\Jobs\SendAppointmentReminderJob;
use App\Models\Appointment;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class SendAppointmentRemindersCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'appointments:send-reminders 
                            {--date= : Specific date to check (Y-m-d format). Defaults to tomorrow}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send SMS reminders to clients for appointments happening tomorrow (or specified date)';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        // Get the target date (default to tomorrow)
        $targetDate = $this->option('date') 
            ? Carbon::parse($this->option('date'))
            : Carbon::tomorrow();

        $this->info("Checking for appointments on {$targetDate->format('Y-m-d')}...");

        // Find appointments for the target date that are scheduled or confirmed
        $appointments = Appointment::with(['client.user', 'veterinary.user', 'pet'])
            ->whereDate('appointment_date', $targetDate->format('Y-m-d'))
            ->whereIn('status', ['scheduled', 'confirmed'])
            ->get();

        if ($appointments->isEmpty()) {
            $this->info("No appointments found for {$targetDate->format('Y-m-d')}.");
            Log::info('No appointments to remind', [
                'target_date' => $targetDate->format('Y-m-d')
            ]);
            return Command::SUCCESS;
        }

        $this->info("Found {$appointments->count()} appointment(s) to remind.");

        $successCount = 0;
        $failedCount = 0;
        $skippedCount = 0;

        foreach ($appointments as $appointment) {
            Log::info('Sending reminder for appointment', [
                'appointment' => $appointment,
                'client' => $appointment->client->user->phone ?? 'No phone number',
                'veterinary' => $appointment->veterinary->user->firstname . " " . $appointment->veterinary->user->lastname ?? 'No veterinary name',
                'user' => $appointment->veterinary->user->firstname . " " . $appointment->veterinary->user->lastname ?? 'No veterinary name',
            ]);
            try {
                // Check if client has phone number
                if (!$appointment->client || !$appointment->client->user || !$appointment->client->user->phone) {
                    $this->warn("Skipping appointment #{$appointment->id}: No phone number available");
                    $skippedCount++;
                    continue;
                }

                // Dispatch the reminder job
                SendAppointmentReminderJob::dispatch($appointment);
                
                $this->info("Reminder queued for appointment #{$appointment->id} - Client: {$appointment->client->user->phone}");
                $successCount++;

            } catch (\Exception $e) {
                $this->error("Failed to queue reminder for appointment #{$appointment->id}: {$e->getMessage()}");
                Log::error('Failed to queue appointment reminder', [
                    'appointment_id' => $appointment->id,
                    'error' => $e->getMessage()
                ]);
                $failedCount++;
            }
        }

        $this->info("\nSummary:");
        $this->info("  - Queued: {$successCount}");
        $this->info("  - Skipped: {$skippedCount}");
        $this->info("  - Failed: {$failedCount}");

        Log::info('Appointment reminders command completed', [
            'target_date' => $targetDate->format('Y-m-d'),
            'total_appointments' => $appointments->count(),
            'queued' => $successCount,
            'skipped' => $skippedCount,
            'failed' => $failedCount
        ]);

        return Command::SUCCESS;
    }
}

