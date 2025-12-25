<?php

namespace App\Jobs;

use App\Models\Appointment;
use App\Services\TwilioService;
use App\Events\AppointmentReminder;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Exception;

class SendAppointmentReminderJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected Appointment $appointment;

    /**
     * Create a new job instance.
     */
    public function __construct(Appointment $appointment)
    {
        $this->appointment = $appointment;
    }

    /**
     * Execute the job.
     */
    public function handle(TwilioService $twilioService): void
    {
        try {
            // Reload the appointment with relationships
            $appointment = $this->appointment->fresh(['client.user', 'veterinary.user', 'pet']);

            // Check if appointment still exists and is valid
            if (!$appointment) {
                Log::warning('Appointment not found for reminder', [
                    'appointment_id' => $this->appointment->id
                ]);
                return;
            }

            // Only send reminder for scheduled or confirmed appointments
            if ($appointment->status !== 'confirmed') {
                Log::info('Skipping reminder for appointment with status', [
                    'appointment_id' => $appointment->id,
                    'status' => $appointment->status
                ]);
                return;
            }

            // Check if client, user, and phone number exist
            if (!$appointment->client || !$appointment->client->user || !$appointment->client->user->phone) {
                Log::warning('Cannot send appointment reminder: missing client phone number', [
                    'appointment_id' => $appointment->id,
                    'has_client' => $appointment->client ? true : false,
                    'has_user' => $appointment->client && $appointment->client->user ? true : false,
                    'has_phone' => $appointment->client && $appointment->client->user && $appointment->client->user->phone ? true : false
                ]);
                return;
            }

            // Build the reminder message
            $veterinaryName = 'le vétérinaire';
            if ($appointment->veterinary && $appointment->veterinary->user) {
                $veterinaryName = $appointment->veterinary->user->firstname . ' ' . $appointment->veterinary->user->lastname;
            }

            $petName = $appointment->pet ? $appointment->pet->name : 'votre animal';
            $appointmentDate = $appointment->appointment_date->format('d/m/Y');
            $startTime = is_string($appointment->start_time) 
                ? date('H:i', strtotime($appointment->start_time)) 
                : $appointment->start_time->format('H:i');

            $message = "Rappel: Vous avez un rendez-vous demain le {$appointmentDate} à {$startTime} avec {$veterinaryName} pour {$petName}.";

            // Send SMS
            $result = $twilioService->sendSMS(
                $appointment->client->user->phone,
                $message
            );

            // Broadcast reminder notification
            if ($result['success']) {
                event(new AppointmentReminder($appointment));
            }

        } catch (Exception $e) {
            Log::error('Exception while sending appointment reminder', [
                'appointment_id' => $this->appointment->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(Exception $exception): void
    {
        Log::error('SendAppointmentReminderJob failed permanently', [
            'appointment_id' => $this->appointment->id,
            'error' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString()
        ]);
    }
}

