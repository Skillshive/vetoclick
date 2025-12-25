<?php

namespace App\Services;

use App\Models\User;
use App\Models\Appointment;
use App\Notifications\AppointmentConfirmed;
use App\Notifications\AppointmentCancelled;
use App\Notifications\AppointmentStatusChanged;
use App\Notifications\AppointmentReminder;
use Illuminate\Support\Collection;

class NotificationService
{
    /**
     * Send appointment confirmed notification
     */
    public function notifyAppointmentConfirmed(Appointment $appointment): void
    {
        if ($appointment->client && $appointment->client->user) {
            $appointment->client->user->notify(new AppointmentConfirmed($appointment));
        }
    }

    /**
     * Send appointment cancelled notification
     */
    public function notifyAppointmentCancelled(Appointment $appointment, ?string $cancelledBy = null): void
    {
        $users = collect();
        
        if ($appointment->client && $appointment->client->user) {
            $users->push($appointment->client->user);
        }
        
        if ($appointment->veterinary && $appointment->veterinary->user) {
            $users->push($appointment->veterinary->user);
        }
        
        $users->each(function ($user) use ($appointment, $cancelledBy) {
            $user->notify(new AppointmentCancelled($appointment, $cancelledBy));
        });
    }

    /**
     * Send appointment status changed notification
     */
    public function notifyAppointmentStatusChanged(Appointment $appointment, string $oldStatus, string $newStatus): void
    {
        $users = collect();
        
        if ($appointment->client && $appointment->client->user) {
            $users->push($appointment->client->user);
        }
        
        if ($appointment->veterinary && $appointment->veterinary->user) {
            $users->push($appointment->veterinary->user);
        }
        
        $users->each(function ($user) use ($appointment, $oldStatus, $newStatus) {
            $user->notify(new AppointmentStatusChanged($appointment, $oldStatus, $newStatus, $user->id));
        });
    }

    /**
     * Send appointment reminder notification
     */
    public function notifyAppointmentReminder(Appointment $appointment, string $reminderTime = '1 hour'): void
    {
        $users = collect();
        
        if ($appointment->client && $appointment->client->user) {
            $users->push($appointment->client->user);
        }
        
        if ($appointment->veterinary && $appointment->veterinary->user) {
            $users->push($appointment->veterinary->user);
        }
        
        $users->each(function ($user) use ($appointment, $reminderTime) {
            $user->notify(new AppointmentReminder($appointment, $reminderTime));
        });
    }

    /**
     * Send notification to specific user
     */
    public function notifyUser(User $user, $notification): void
    {
        $user->notify($notification);
    }

    /**
     * Send notification to multiple users
     */
    public function notifyUsers(Collection $users, $notification): void
    {
        $users->each(function ($user) use ($notification) {
            $user->notify($notification);
        });
    }

    /**
     * Get user's unread notifications count
     */
    public function getUnreadCount(User $user): int
    {
        return $user->unreadNotifications()->count();
    }

    /**
     * Mark notification as read
     */
    public function markAsRead(User $user, string $notificationId): bool
    {
        $notification = $user->notifications()->find($notificationId);
        
        if ($notification) {
            $notification->markAsRead();
            return true;
        }
        
        return false;
    }

    /**
     * Mark all notifications as read for a user
     */
    public function markAllAsRead(User $user): void
    {
        $user->unreadNotifications->markAsRead();
    }
}

