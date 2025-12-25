<?php

use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

// Private user channel for notifications
Broadcast::channel('user.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});

// Private notification channel (used by Laravel's notification system)
Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Public appointments channel (all authenticated users can listen)
Broadcast::channel('appointments', function ($user) {
    return $user !== null;
});

// Admin appointments channel (only admins)
Broadcast::channel('admin.appointments', function ($user) {
    return $user->hasRole('admin');
});

