<?php

namespace App\Events;

use App\Models\Appointment;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AppointmentCreated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $appointment;

    /**
     * Create a new event instance.
     */
    public function __construct(Appointment $appointment)
    {
        $this->appointment = $appointment->load(['client.user', 'veterinary.user', 'pet']);
        
        \Illuminate\Support\Facades\Log::info('AppointmentCreated event constructed', [
            'appointment_id' => $appointment->id,
            'client_user_id' => $appointment->client?->user_id,
            'veterinary_user_id' => $appointment->veterinary?->user_id,
        ]);
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        $channels = [
            new Channel('appointments'), // Public channel for all authenticated users
        ];

        // Broadcast to specific user channels
        if ($this->appointment->veterinary && $this->appointment->veterinary->user) {
            $channels[] = new PrivateChannel('user.' . $this->appointment->veterinary->user_id);
        }

        if ($this->appointment->client && $this->appointment->client->user) {
            $channels[] = new PrivateChannel('user.' . $this->appointment->client->user_id);
        }

        // Broadcast to admin channel for admin users
        $channels[] = new Channel('admin.appointments');

        return $channels;
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'appointment.created';
    }

    /**
     * Get the data to broadcast.
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'appointment' => [
                'id' => $this->appointment->id,
                'uuid' => $this->appointment->uuid,
                'appointment_date' => $this->appointment->appointment_date,
                'start_time' => $this->appointment->start_time,
                'end_time' => $this->appointment->end_time,
                'status' => $this->appointment->status,
                'veterinary' => $this->appointment->veterinary ? [
                    'id' => $this->appointment->veterinary->id,
                    'name' => $this->appointment->veterinary->user ? 
                        $this->appointment->veterinary->user->firstname . ' ' . $this->appointment->veterinary->user->lastname : 
                        'Unknown',
                ] : null,
                'client' => $this->appointment->client ? [
                    'id' => $this->appointment->client->id,
                    'name' => $this->appointment->client->user ? 
                        $this->appointment->client->user->firstname . ' ' . $this->appointment->client->user->lastname : 
                        'Unknown',
                ] : null,
                'pet' => $this->appointment->pet ? [
                    'id' => $this->appointment->pet->id,
                    'name' => $this->appointment->pet->name,
                ] : null,
            ],
            'message' => 'New appointment created',
            'type' => 'appointment_created',
        ];
    }
}

