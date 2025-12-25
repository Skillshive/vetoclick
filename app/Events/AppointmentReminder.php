<?php

namespace App\Events;

use App\Models\Appointment;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AppointmentReminder implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $appointment;

    /**
     * Create a new event instance.
     */
    public function __construct(Appointment $appointment)
    {
        $this->appointment = $appointment->load(['client.user', 'veterinary.user', 'pet']);
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        $channels = [];

        // Broadcast to client only
        if ($this->appointment->client && $this->appointment->client->user) {
            $channels[] = new PrivateChannel('user.' . $this->appointment->client->user_id);
        }

        return $channels;
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'appointment.reminder';
    }

    /**
     * Get the data to broadcast.
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        $veterinaryName = 'le vétérinaire';
        if ($this->appointment->veterinary && $this->appointment->veterinary->user) {
            $veterinaryName = $this->appointment->veterinary->user->firstname . ' ' . 
                            $this->appointment->veterinary->user->lastname;
        }

        $petName = $this->appointment->pet ? $this->appointment->pet->name : 'votre animal';
        $appointmentDate = $this->appointment->appointment_date->format('d/m/Y');
        $startTime = is_string($this->appointment->start_time) 
            ? date('H:i', strtotime($this->appointment->start_time)) 
            : $this->appointment->start_time->format('H:i');

        return [
            'appointment' => [
                'id' => $this->appointment->id,
                'uuid' => $this->appointment->uuid,
                'appointment_date' => $this->appointment->appointment_date,
                'start_time' => $this->appointment->start_time,
            ],
            'message' => "Rappel: Vous avez un rendez-vous demain le {$appointmentDate} à {$startTime} avec {$veterinaryName} pour {$petName}.",
            'type' => 'appointment_reminder',
            'title' => 'Rappel de rendez-vous',
        ];
    }
}

