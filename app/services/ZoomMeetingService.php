<?php

namespace App\Services;

use App\common\AppointmentDTO;
use Exception;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ZoomMeetingService
{
    protected string $accountId;
    protected string $clientId;
    protected string $clientSecret;
    protected string $defaultUser;

    public function __construct()
    {
        $this->accountId = (string) Config::get('services.zoom.account_id');
        $this->clientId = (string) Config::get('services.zoom.client_id');
        $this->clientSecret = (string) Config::get('services.zoom.client_secret');
        $this->defaultUser = (string) Config::get('services.zoom.user', 'me');
    }

    /**
     * Create a Zoom meeting with auto-recording if requested.
     *
     * @throws Exception
     */
    public function createMeeting(AppointmentDTO $dto): array
    {
        if (empty($this->accountId) || empty($this->clientId) || empty($this->clientSecret)) {
            throw new Exception('Zoom credentials are not configured.');
        }

        $token = $this->getAccessToken();

        $startDateTime = $this->buildStartDateTime($dto);
        $duration = $dto->duration_minutes ?? $this->calculateDurationFromTimes($dto);

        $payload = [
            'topic' => $dto->reason_for_visit ?? 'Veterinary consultation',
            'type' => 2,
            'start_time' => $startDateTime->toIso8601String(),
            'duration' => $duration,
            'timezone' => $startDateTime->timezoneName,
            'settings' => [
                'join_before_host' => false,
                'waiting_room' => true,
                'auto_recording' => $dto->auto_record ? 'cloud' : 'none',
                'meeting_authentication' => false,
            ],
        ];

        $response = Http::withToken($token)
            ->post("https://api.zoom.us/v2/users/{$this->defaultUser}/meetings", $payload);

        if ($response->failed()) {
            Log::error('Failed to create Zoom meeting', [
                'payload' => $payload,
                'response' => $response->json(),
            ]);

            throw new Exception('Unable to create Zoom meeting.');
        }

        $meeting = $response->json();

        return [
            'id' => (string) ($meeting['id'] ?? ''),
            'uuid' => (string) ($meeting['uuid'] ?? ''),
            'join_url' => $meeting['join_url'] ?? null,
            'start_url' => $meeting['start_url'] ?? null,
            'password' => $meeting['password'] ?? null,
            'recording_status' => $dto->auto_record ? 'pending' : null,
        ];
    }

    /**
     * Obtain and cache Zoom access token.
     */
    protected function getAccessToken(): string
    {
        $cacheKey = 'zoom_access_token';

        if (Cache::has($cacheKey)) {
            return (string) Cache::get($cacheKey);
        }

        $response = Http::asForm()
            ->withBasicAuth($this->clientId, $this->clientSecret)
            ->post('https://zoom.us/oauth/token', [
                'grant_type' => 'account_credentials',
                'account_id' => $this->accountId,
            ]);

        if ($response->failed()) {
            Log::error('Failed to obtain Zoom access token', [
                'response' => $response->json(),
            ]);

            throw new Exception('Unable to fetch Zoom access token.');
        }

        $data = $response->json();

        $ttl = isset($data['expires_in']) ? max((int) $data['expires_in'] - 60, 60) : 3000;

        Cache::put($cacheKey, $data['access_token'], now()->addSeconds($ttl));

        return (string) $data['access_token'];
    }

    /**
     * Build timezone-aware datetime.
     */
    protected function buildStartDateTime(AppointmentDTO $dto): Carbon
    {
        $date = $dto->appointment_date ?? now()->toDateString();
        $time = $dto->start_time ?? now()->format('H:i');

        return Carbon::parse("{$date} {$time}", config('app.timezone', 'UTC'));
    }

    /**
     * Derive duration from provided times.
     */
    protected function calculateDurationFromTimes(AppointmentDTO $dto): int
    {
        if (empty($dto->start_time) || empty($dto->end_time)) {
            return 45;
        }

        try {
            $start = Carbon::createFromFormat('H:i', $dto->start_time);
            $end = Carbon::createFromFormat('H:i', $dto->end_time);

            if ($end->lessThanOrEqualTo($start)) {
                $end->addDay();
            }

            return max(15, (int) ceil($start->diffInMinutes($end) ?: 45));
        } catch (Exception) {
            return 45;
        }
    }
}

