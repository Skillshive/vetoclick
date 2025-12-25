<?php

namespace App\Notifications;

use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Broadcasting\PrivateChannel;

class AppointmentStatusChanged extends Notification implements ShouldBroadcastNow
{
    use Queueable;

    public $appointment;
    public $oldStatus;
    public $newStatus;
    public $targetUserId;

    /**
     * Create a new notification instance.
     */
    public function __construct(Appointment $appointment, string $oldStatus, string $newStatus, ?int $targetUserId = null)
    {
        $this->appointment = $appointment->load(['client.user', 'veterinary.user', 'pet']);
        $this->oldStatus = $oldStatus;
        $this->newStatus = $newStatus;
        $this->targetUserId = $targetUserId;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        // Use the target user ID if provided, otherwise fallback to client user
        $userId = $this->targetUserId;
        if (!$userId && $this->appointment->client && $this->appointment->client->user) {
            $userId = $this->appointment->client->user->id;
        } elseif (!$userId && $this->appointment->veterinary && $this->appointment->veterinary->user) {
            $userId = $this->appointment->veterinary->user->id;
        }
        
        return $userId ? [new PrivateChannel('user.' . $userId)] : [];
    }

    /**
     * Get the broadcastable representation of the notification.
     */
    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }

    /**
     * Get the type of the notification being broadcast.
     */
    public function broadcastType(): string
    {
        return 'appointment.status.changed';
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $statusMessages = [
            'scheduled' => 'programmé',
            'confirmed' => 'confirmé',
            'cancelled' => 'annulé',
            'completed' => 'terminé',
            'no_show' => 'non présenté',
        ];

        $statusTitles = [
            'scheduled' => 'Rendez-vous programmé',
            'confirmed' => 'Rendez-vous confirmé',
            'cancelled' => 'Rendez-vous annulé',
            'completed' => 'Rendez-vous terminé',
            'no_show' => 'Absence constatée',
        ];

        $vetName = $this->appointment->veterinary && $this->appointment->veterinary->user
            ? $this->appointment->veterinary->user->firstname . ' ' . $this->appointment->veterinary->user->lastname
            : 'le vétérinaire';
        
        $petName = $this->appointment->pet ? $this->appointment->pet->name : 'votre animal';
        
        $date = $this->appointment->appointment_date 
            ? (new \DateTime($this->appointment->appointment_date))->format('d/m/Y')
            : '';
        
        $time = $this->appointment->start_time 
            ? (is_string($this->appointment->start_time) 
                ? substr($this->appointment->start_time, 0, 5) 
                : $this->appointment->start_time->format('H:i'))
            : '';

        $statusText = $statusMessages[$this->newStatus] ?? $this->newStatus;

        return [
            'type' => 'appointment_status_changed',
            'title' => $statusTitles[$this->newStatus] ?? 'Statut du rendez-vous mis à jour',
            'message' => "Le rendez-vous avec {$vetName} pour {$petName} le {$date} à {$time} est maintenant {$statusText}.",
            'appointment' => [
                'id' => $this->appointment->id,
                'uuid' => $this->appointment->uuid,
                'appointment_date' => $this->appointment->appointment_date,
                'start_time' => $this->appointment->start_time,
                'end_time' => $this->appointment->end_time,
                'status' => $this->appointment->status,
                'old_status' => $this->oldStatus,
                'new_status' => $this->newStatus,
                'veterinary' => $this->appointment->veterinary ? [
                    'id' => $this->appointment->veterinary->id,
                    'name' => $vetName,
                ] : null,
                'client' => $this->appointment->client ? [
                    'id' => $this->appointment->client->id,
                    'name' => $this->appointment->client->user 
                        ? $this->appointment->client->user->firstname . ' ' . $this->appointment->client->user->lastname
                        : 'Unknown',
                ] : null,
                'pet' => $this->appointment->pet ? [
                    'id' => $this->appointment->pet->id,
                    'name' => $this->appointment->pet->name,
                ] : null,
            ],
            'time' => now()->toIso8601String(),
        ];
    }
}
