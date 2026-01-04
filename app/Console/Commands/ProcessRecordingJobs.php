<?php

namespace App\Console\Commands;

use App\Jobs\DownloadMeetingRecordingJob;
use App\Models\Appointment;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class ProcessRecordingJobs extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'recordings:process 
                            {--uuid= : Process specific appointment UUID}
                            {--all : Process all appointments without recordings}
                            {--started : Process only appointments that have started but no recording}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Process recording download jobs for appointments';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        if ($this->option('uuid')) {
            $this->processSpecificAppointment($this->option('uuid'));
        } elseif ($this->option('all')) {
            $this->processAllAppointments();
        } elseif ($this->option('started')) {
            $this->processStartedAppointments();
        } else {
            $this->info('Please specify --uuid, --all, or --started option');
            $this->info('Examples:');
            $this->info('  php artisan recordings:process --uuid=appointment-uuid');
            $this->info('  php artisan recordings:process --started');
            $this->info('  php artisan recordings:process --all');
        }
    }

    protected function processSpecificAppointment(string $uuid)
    {
        $appointment = Appointment::where('uuid', $uuid)->first();
        
        if (!$appointment) {
            $this->error("Appointment not found: {$uuid}");
            return;
        }

        $this->info("Processing appointment: {$uuid}");
        $this->info("Meeting ID: " . ($appointment->video_meeting_id ?? 'N/A'));
        $this->info("Started: " . ($appointment->meeting_started_at ?? 'Not started'));
        $this->info("Ended: " . ($appointment->meeting_ended_at ?? 'Not ended'));
        $this->info("Recording URL: " . ($appointment->video_recording_url ?? 'Not set'));

        // Dispatch job immediately
        DownloadMeetingRecordingJob::dispatch($uuid);
        $this->info("Recording job dispatched for appointment: {$uuid}");
    }

    protected function processStartedAppointments()
    {
        $appointments = Appointment::whereNotNull('meeting_started_at')
            ->whereNull('video_recording_url')
            ->whereNotNull('video_meeting_id')
            ->get();

        $this->info("Found {$appointments->count()} appointments with meetings started but no recording");

        foreach ($appointments as $appointment) {
            $this->info("Processing appointment: {$appointment->uuid}");
            DownloadMeetingRecordingJob::dispatch($appointment->uuid);
        }

        $this->info("Dispatched {$appointments->count()} recording jobs");
    }

    protected function processAllAppointments()
    {
        $appointments = Appointment::whereNull('video_recording_url')
            ->whereNotNull('video_meeting_id')
            ->get();

        $this->info("Found {$appointments->count()} appointments without recordings");

        foreach ($appointments as $appointment) {
            $this->info("Processing appointment: {$appointment->uuid}");
            DownloadMeetingRecordingJob::dispatch($appointment->uuid);
        }

        $this->info("Dispatched {$appointments->count()} recording jobs");
    }
}
