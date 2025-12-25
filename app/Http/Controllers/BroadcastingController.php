<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class BroadcastingController extends Controller
{
    /**
     * Authenticate the request for channel access.
     */
    public function authenticate(Request $request)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $channelName = $request->input('channel_name');
        $socketId = $request->input('socket_id');

        // Handle private user channels
        if (str_starts_with($channelName, 'private-user.')) {
            $userId = str_replace('private-user.', '', $channelName);
            
            // User can only subscribe to their own channel
            if ($user->id == $userId) {
                return $this->authorizeChannel($channelName, $socketId);
            }
        }

        // Handle public appointments channel (authenticated users only)
        if ($channelName === 'appointments') {
            if ($user) {
                return $this->authorizeChannel($channelName, $socketId);
            }
        }

        // Handle admin appointments channel (admin users only)
        if ($channelName === 'admin.appointments') {
            if ($user && $user->hasRole('admin')) {
                return $this->authorizeChannel($channelName, $socketId);
            }
        }

        return response()->json(['message' => 'Forbidden'], 403);
    }

    /**
     * Authorize the channel using Pusher.
     */
    protected function authorizeChannel(string $channelName, string $socketId)
    {
        $pusher = app('pusher');
        
        if (str_starts_with($channelName, 'private-')) {
            $auth = $pusher->authorizeChannel($channelName, $socketId);
        } else {
            $auth = $pusher->authorizeChannel($channelName, $socketId);
        }

        return response($auth, 200)
            ->header('Content-Type', 'application/json');
    }
}

