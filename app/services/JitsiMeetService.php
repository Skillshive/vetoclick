<?php

namespace App\Services;

use Illuminate\Support\Str;
use Carbon\Carbon;

class JitsiMeetService
{
    /**
     * Generate a VetoClick Meet link for an appointment based on date and time
     *
     * @param string $appointmentUuid The appointment UUID
     * @param string $appointmentDate The appointment date (Y-m-d format)
     * @param string $startTime The appointment start time (H:i format)
     * @param string|null $clientName Optional client name for room display name
     * @param string|null $petName Optional pet name for room display name
     * @return array Returns an array with 'meeting_id' and 'join_url'
     */
    public function generateMeetingLink(string $appointmentUuid, string $appointmentDate, string $startTime, ?string $clientName = null, ?string $petName = null, ?string $redirectUrl = null, bool $trackEndOnRedirect = true): array
    {
        $domain = config('services.jitsi.domain', 'jitsi.colabcorner.com');
        
        // Create a unique room name based on appointment date and time
        $roomName = $this->generateRoomName($appointmentDate, $startTime, $appointmentUuid);
        
        // Generate meeting ID (can be same as room name or separate)
        $meetingId = $roomName;
        
        // Build the VetoClick Meet URL
        $joinUrl = "https://{$domain}/{$roomName}";
        
        // Add optional parameters for better meeting experience
        $params = [];
        
        // Add user info if available
        if ($clientName) {
            $params['userInfo.displayName'] = urlencode($clientName);
        }
        
        // Add config options
        $params['config.startWithVideoMuted'] = 'false';
        $params['config.startWithAudioMuted'] = 'false';
        
        // Add redirect URL - where to redirect users when they leave the meeting
        // Include appointment UUID in redirect URL to track meeting end
        if ($trackEndOnRedirect) {
            $endMeetingUrl = url("/appointments/{$appointmentUuid}/end-meeting-on-leave");
            if ($redirectUrl) {
                // Ensure redirect URL is absolute and add end tracking
                if (!filter_var($redirectUrl, FILTER_VALIDATE_URL)) {
                    $redirectUrl = url($redirectUrl);
                }
                // Combine end tracking with redirect
                $params['config.leaveButtonURL'] = urlencode($endMeetingUrl . '?redirect=' . urlencode($redirectUrl));
            } else {
                // Default redirect to app dashboard with end tracking
                $defaultRedirect = url('/dashboard');
                $params['config.leaveButtonURL'] = urlencode($endMeetingUrl . '?redirect=' . urlencode($defaultRedirect));
            }
        } else {
            // Original behavior without end tracking
            if ($redirectUrl) {
                // Ensure redirect URL is absolute
                if (!filter_var($redirectUrl, FILTER_VALIDATE_URL)) {
                    $redirectUrl = url($redirectUrl);
                }
                $params['config.leaveButtonURL'] = urlencode($redirectUrl);
            } else {
                // Default redirect to app dashboard
                $appUrl = config('app.url', url('/'));
                $defaultRedirect = url('/dashboard');
                $params['config.leaveButtonURL'] = urlencode($defaultRedirect);
            }
        }
        
        // Add custom branding if configured
        $branding = config('services.jitsi.branding', []);
        
        if (!empty($branding['display_name'])) {
            $params['config.brandingDisplayName'] = urlencode($branding['display_name']);
        }
        
        if (!empty($branding['logo_url'])) {
            // Ensure the logo URL is absolute and publicly accessible
            $logoUrl = $branding['logo_url'];
            if (!filter_var($logoUrl, FILTER_VALIDATE_URL)) {
                // If relative URL, make it absolute with full domain
                // VetoClick Meet needs full HTTPS URLs to load the logo
                $logoUrl = url($logoUrl);
            }
            $params['config.brandingLogoUrl'] = urlencode($logoUrl);
        }
        
        if (!empty($branding['watermark_url'])) {
            $watermarkUrl = $branding['watermark_url'];
            if (!filter_var($watermarkUrl, FILTER_VALIDATE_URL)) {
                // Make it absolute with full domain
                $watermarkUrl = url($watermarkUrl);
            }
            $params['config.brandingWatermarkUrl'] = urlencode($watermarkUrl);
        }
        
        if (!empty($branding['watermark_link'])) {
            $params['config.brandingWatermarkLink'] = urlencode($branding['watermark_link']);
        }
        
        // Add VetoClick brand colors
        if (!empty($branding['primary_color'])) {
            $params['config.primaryColor'] = urlencode($branding['primary_color']);
        }
        
        if (!empty($branding['secondary_color'])) {
            $params['config.secondaryColor'] = urlencode($branding['secondary_color']);
        }
        
        // Additional branding options
        $params['config.hideDisplayName'] = 'false';
        $params['config.prejoinPageEnabled'] = 'true';
        $params['config.requireDisplayName'] = 'false';
        
        $params['config.enableRecordingService'] = 'true';
        $params['config.recordingServiceEnabled'] = 'true';
        $params['config.liveStreamingEnabled'] = 'false'; // Disable live streaming, use recording instead

        $params['config.enableAutoRecording'] = 'true';
        
        if (!empty($params)) {
            $joinUrl .= '?' . http_build_query($params);
        }
        
        return [
            'meeting_id' => $meetingId,
            'join_url' => $joinUrl,
        ];
    }
    
    /**
     * Generate a URL-safe room name from appointment date and time
     *
     * @param string $appointmentDate Date in Y-m-d format
     * @param string $startTime Time in H:i format
     * @param string $appointmentUuid Appointment UUID for uniqueness
     * @return string
     */
    private function generateRoomName(string $appointmentDate, string $startTime, string $appointmentUuid): string
    {
        // Format: vet-appt-YYYYMMDD-HHMM-{short-uuid}
        // Example: vet-appt-20240115-1430-a1b2c3d4
        
        // Parse date and time
        $date = Carbon::createFromFormat('Y-m-d', $appointmentDate);
        $time = Carbon::createFromFormat('H:i', $startTime);
        
        // Format: YYYYMMDD-HHMM
        $dateTimePart = $date->format('Ymd') . '-' . $time->format('Hi');
        
        // Get short UUID (first 8 characters without hyphens)
        $shortUuid = substr(str_replace('-', '', $appointmentUuid), 0, 8);
        
        // Combine: vet-appt-YYYYMMDD-HHMM-{short-uuid}
        $roomName = 'vet-appt-' . $dateTimePart . '-' . $shortUuid;
        
        return $roomName;
    }
    
    /**
     * Check if the meeting can be accessed based on appointment date and time
     * Allows access 5 minutes before the scheduled time and up to 1 hour after
     *
     * @param string $appointmentDate Date in Y-m-d format
     * @param string $startTime Time in H:i format
     * @param int $bufferMinutesBefore Minutes before appointment to allow access (default: 5)
     * @param int $bufferMinutesAfter Minutes after appointment to allow access (default: 60)
     * @return array Returns ['can_access' => bool, 'message' => string, 'appointment_datetime' => Carbon]
     */
    public function canAccessMeeting(string $appointmentDate, string $startTime, int $bufferMinutesBefore = 5, int $bufferMinutesAfter = 60): array
    {
        try {
            // Parse appointment date and time
            $appointmentDateTime = Carbon::createFromFormat('Y-m-d H:i', $appointmentDate . ' ' . $startTime);
            $now = Carbon::now();
            
            // Calculate time windows
            $earliestAccess = $appointmentDateTime->copy()->subMinutes($bufferMinutesBefore);
            $latestAccess = $appointmentDateTime->copy()->addMinutes($bufferMinutesAfter);
            
            // Check if current time is within access window
            $canAccess = $now->between($earliestAccess, $latestAccess);
            
            if ($canAccess) {
                return [
                    'can_access' => true,
                    'message' => 'Meeting is available',
                    'appointment_datetime' => $appointmentDateTime,
                    'current_datetime' => $now,
                ];
            } else {
                if ($now->lt($earliestAccess)) {
                    $secondsUntil = $now->diffInSeconds($earliestAccess);
                    $totalMinutes = $secondsUntil / 60.0;
                    
                    // Format time: if > 60 minutes, convert to hours, otherwise show minutes and seconds
                    if ($totalMinutes > 60) {
                        $hours = floor($totalMinutes / 60);
                        $remainingMinutes = floor($totalMinutes % 60);
                        $hoursUnit = $hours == 1 ? 'hour' : 'hours';
                        $minutesUnit = $remainingMinutes == 1 ? 'minute' : 'minutes';
                        
                        if ($remainingMinutes > 0) {
                            $message = "Meeting will be available in {$hours} {$hoursUnit} {$remainingMinutes} {$minutesUnit}";
                        } else {
                            $message = "Meeting will be available in {$hours} {$hoursUnit}";
                        }
                    } else {
                        $minutes = floor($totalMinutes);
                        $seconds = $secondsUntil % 60;
                        $minutesUnit = $minutes == 1 ? 'minute' : 'minutes';
                        $secondsUnit = $seconds == 1 ? 'second' : 'seconds';
                        
                        if ($minutes > 0 && $seconds > 0) {
                            $message = "Meeting will be available in {$minutes} {$minutesUnit} {$seconds} {$secondsUnit}";
                        } else if ($minutes > 0) {
                            $message = "Meeting will be available in {$minutes} {$minutesUnit}";
                        } else {
                            $message = "Meeting will be available in {$seconds} {$secondsUnit}";
                        }
                    }
                    
                    return [
                        'can_access' => false,
                        'message' => $message,
                        'appointment_datetime' => $appointmentDateTime,
                        'current_datetime' => $now,
                        'earliest_access' => $earliestAccess,
                    ];
                } else {
                    return [
                        'can_access' => false,
                        'message' => 'Meeting time has passed',
                        'appointment_datetime' => $appointmentDateTime,
                        'current_datetime' => $now,
                        'latest_access' => $latestAccess,
                    ];
                }
            }
        } catch (\Exception $e) {
            return [
                'can_access' => false,
                'message' => 'Invalid appointment date or time format',
                'error' => $e->getMessage(),
            ];
        }
    }
    
    /**
     * Generate a meeting link with custom room name
     *
     * @param string $roomName Custom room name
     * @return string
     */
    public function generateCustomMeetingLink(string $roomName): string
    {
        $domain = config('services.jitsi.domain', 'jitsi.colabcorner.com');
        
        // Sanitize room name to be URL-safe
        $sanitizedRoomName = preg_replace('/[^a-zA-Z0-9-]/', '', $roomName);
        
        return "https://{$domain}/{$sanitizedRoomName}";
    }

    /**
     * Get recording URL for a meeting
     * This tries multiple common Jitsi recording URL patterns
     *
     * @param string $meetingId The meeting ID
     * @return string|null
     */
    public function getRecordingUrl(string $meetingId): ?string
    {
        $domain = config('services.jitsi.domain', 'jitsi.colabcorner.com');
        
        // Common Jitsi recording URL patterns
        $possibleUrls = [
            "https://{$domain}/recordings/{$meetingId}",
            "https://{$domain}/recordings/{$meetingId}.mp4",
            "https://{$domain}/recordings/{$meetingId}/recording.mp4",
        ];

        // Try to find which URL works
        foreach ($possibleUrls as $url) {
            try {
                $context = stream_context_create([
                    'http' => [
                        'method' => 'HEAD',
                        'timeout' => 5,
                    ]
                ]);
                
                $headers = @get_headers($url, 1);
                if ($headers && strpos($headers[0], '200') !== false) {
                    return $url;
                }
            } catch (\Exception $e) {
                continue;
            }
        }

        return null;
    }
}

