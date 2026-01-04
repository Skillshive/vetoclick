<?php

namespace App\Jobs;

use App\Models\Appointment;
use App\Services\AppointmentService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Exception;

class DownloadMeetingRecordingJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected string $appointmentUuid;
    protected int $maxAttempts = 5;
    protected int $tries = 5;

    /**
     * Create a new job instance.
     */
    public function __construct(string $appointmentUuid)
    {
        $this->appointmentUuid = $appointmentUuid;
    }

    /**
     * Execute the job.
     */
    public function handle(AppointmentService $appointmentService): void
    {
        try {
            $appointment = $appointmentService->getByUuid($this->appointmentUuid);

            if (!$appointment) {
                Log::warning("Appointment not found for recording download", [
                    'uuid' => $this->appointmentUuid
                ]);
                return;
            }

            if (!$appointment->video_meeting_id) {
                Log::warning("No video meeting ID found for appointment", [
                    'uuid' => $this->appointmentUuid
                ]);
                return;
            }

            // Check if we already have a local recording file stored
            $existingUrl = $appointment->video_recording_url;
            if ($existingUrl && strpos($existingUrl, '/storage/recordings/') !== false) {
                // Already have a local file stored, check if it exists
                $relativePath = str_replace(asset('storage/'), '', $existingUrl);
                if (Storage::disk('public')->exists($relativePath)) {
                    Log::info("Recording already downloaded and stored", [
                        'uuid' => $this->appointmentUuid,
                        'path' => $relativePath
                    ]);
                    return;
                }
            }

            // Try to get recording from Jitsi
            // First check if we have an external URL from webhook/manual entry
            $recordingUrl = null;
            if ($existingUrl && strpos($existingUrl, 'http') === 0 && strpos($existingUrl, '/storage/') === false) {
                // We have an external URL, use it to download
                $recordingUrl = $existingUrl;
                Log::info("Using existing external recording URL", ['url' => $recordingUrl]);
            } else {
                // Try to find recording URL from Jitsi server
                $recordingUrl = $this->getRecordingUrl($appointment->video_meeting_id);
            }

            if ($recordingUrl) {
                // Download and store the recording
                $storedPath = $this->downloadAndStoreRecording($recordingUrl, $appointment->uuid);
                
                if ($storedPath) {
                    $appointment->update([
                        'video_recording_url' => asset('storage/' . $storedPath)
                    ]);
                    
                    Log::info("Recording downloaded and stored successfully", [
                        'uuid' => $this->appointmentUuid,
                        'path' => $storedPath
                    ]);
                    return; // Success - exit gracefully
                } else {
                    // If download failed but we have a URL, save the URL for manual download later
                    if ($recordingUrl && !$existingUrl) {
                        $appointment->update([
                            'video_recording_url' => $recordingUrl
                        ]);
                        Log::info("Saved external recording URL for manual download", [
                            'uuid' => $this->appointmentUuid,
                            'url' => $recordingUrl
                        ]);
                        return; // Saved URL - exit gracefully
                    }
                    // Only throw if we haven't exceeded max attempts
                    if ($this->attempts() < $this->maxAttempts) {
                        throw new Exception("Failed to download recording, will retry");
                    } else {
                        Log::warning("Failed to download recording after max attempts", [
                            'uuid' => $this->appointmentUuid,
                            'url' => $recordingUrl,
                            'attempts' => $this->attempts()
                        ]);
                        return; // Exceeded max attempts - exit gracefully without failing
                    }
                }
            } else {
                // Check if meeting has ended - if not, recording might not be available yet
                $meetingEnded = $appointment->meeting_ended_at !== null;
                
                if ($meetingEnded) {
                    // Meeting was ended via endMeetingOnLeave - calculate time since end
                    $endedAt = Carbon::parse($appointment->meeting_ended_at);
                    $minutesSinceEnd = now()->diffInMinutes($endedAt, false);
                    
                    // If meeting ended less than 15 minutes ago, retry
                    if ($minutesSinceEnd < 15) {
                        if ($this->attempts() < $this->maxAttempts) {
                            Log::info("Recording not yet available, will retry", [
                                'uuid' => $this->appointmentUuid,
                                'meeting_id' => $appointment->video_meeting_id,
                                'minutes_since_end' => $minutesSinceEnd,
                                'attempt' => $this->attempts()
                            ]);
                            throw new Exception("Recording not yet available, will retry");
                        } else {
                            Log::warning("Recording not found after max attempts - may not be available", [
                                'uuid' => $this->appointmentUuid,
                                'meeting_id' => $appointment->video_meeting_id,
                                'minutes_since_end' => $minutesSinceEnd,
                                'attempts' => $this->attempts()
                            ]);
                            return; // Exceeded max attempts - exit gracefully
                        }
                    } else {
                        // Meeting ended more than 15 minutes ago and still no recording
                        Log::warning("Recording not found for meeting that ended {$minutesSinceEnd} minutes ago - may not be available", [
                            'uuid' => $this->appointmentUuid,
                            'meeting_id' => $appointment->video_meeting_id,
                            'minutes_since_end' => $minutesSinceEnd,
                            'attempts' => $this->attempts(),
                            'note' => 'Jitsi auto-recording may not be configured or meeting was not recorded'
                        ]);
                        return; // Don't retry if meeting ended long ago - exit gracefully
                    }
                } else {
                    // Meeting hasn't been ended yet - calculate based on appointment end time
                    $appointmentDate = Carbon::parse($appointment->appointment_date);
                    $endTime = Carbon::createFromFormat('H:i:s', $appointment->end_time);
                    $appointmentEndDateTime = $appointmentDate->copy()->setTime($endTime->hour, $endTime->minute, $endTime->second);
                    $minutesSinceEnd = now()->diffInMinutes($appointmentEndDateTime, false);
                    
                    // If appointment end time is in the future or less than 15 minutes ago, retry
                    if ($minutesSinceEnd < 15) {
                        if ($this->attempts() < $this->maxAttempts) {
                            Log::info("Recording not yet available, will retry (appointment end: {$minutesSinceEnd} min ago)", [
                                'uuid' => $this->appointmentUuid,
                                'meeting_id' => $appointment->video_meeting_id,
                                'minutes_since_appointment_end' => $minutesSinceEnd,
                                'attempt' => $this->attempts()
                            ]);
                            throw new Exception("Recording not yet available, will retry");
                        } else {
                            Log::warning("Recording not found after max attempts", [
                                'uuid' => $this->appointmentUuid,
                                'meeting_id' => $appointment->video_meeting_id,
                                'minutes_since_appointment_end' => $minutesSinceEnd,
                                'attempts' => $this->attempts()
                            ]);
                            return; // Exceeded max attempts - exit gracefully
                        }
                    } else {
                        // Appointment ended more than 15 minutes ago and still no recording
                        Log::warning("Recording not found for appointment that ended {$minutesSinceEnd} minutes ago - may not be available", [
                            'uuid' => $this->appointmentUuid,
                            'meeting_id' => $appointment->video_meeting_id,
                            'minutes_since_appointment_end' => $minutesSinceEnd,
                            'attempts' => $this->attempts(),
                            'note' => 'Jitsi auto-recording may not be configured or meeting was not recorded'
                        ]);
                        return; // Don't retry if appointment ended long ago - exit gracefully
                    }
                }
            }

        } catch (Exception $e) {
            Log::error("Exception in recording download job", [
                'uuid' => $this->appointmentUuid,
                'error' => $e->getMessage(),
                'attempt' => $this->attempts(),
                'max_attempts' => $this->maxAttempts
            ]);

            // Retry if we haven't exceeded max attempts
            if ($this->attempts() < $this->maxAttempts) {
                throw $e; // This will trigger a retry
            } else {
                // After max attempts, log and exit gracefully instead of failing
                Log::warning("Recording download job exceeded max attempts, exiting gracefully", [
                    'uuid' => $this->appointmentUuid,
                    'error' => $e->getMessage(),
                    'attempts' => $this->attempts()
                ]);
                return; // Exit gracefully instead of failing permanently
            }
        }
    }

    /**
     * Get recording URL from Jitsi/Jibri
     * Checks multiple locations where Jibri might store recordings
     */
    protected function getRecordingUrl(string $meetingId): ?string
    {
        $jitsiDomain = config('services.jitsi.domain', 'jitsi.colabcorner.com');
        $recordingsBaseUrl = config('services.jitsi.recordings.base_url');
        $formats = config('services.jitsi.recordings.formats', ['webm', 'mp4', 'mkv']);
        
        // Build list of possible URLs to check
        $possibleUrls = [];
        
        // If custom recordings URL is configured, check there first
        if ($recordingsBaseUrl) {
            foreach ($formats as $format) {
                $possibleUrls[] = rtrim($recordingsBaseUrl, '/') . "/{$meetingId}.{$format}";
                $possibleUrls[] = rtrim($recordingsBaseUrl, '/') . "/{$meetingId}/recording.{$format}";
            }
        }
        
        // Jibri default patterns - check main domain
        foreach ($formats as $format) {
            // Pattern 1: /recordings/meeting-id.format
            $possibleUrls[] = "https://{$jitsiDomain}/recordings/{$meetingId}.{$format}";
            
            // Pattern 2: /recordings/meeting-id/recording.format
            $possibleUrls[] = "https://{$jitsiDomain}/recordings/{$meetingId}/recording.{$format}";
            
            // Pattern 3: Jibri finalize script might create date-based folders
            $today = date('Y-m-d');
            $possibleUrls[] = "https://{$jitsiDomain}/recordings/{$today}/{$meetingId}.{$format}";
            
            // Pattern 4: Some setups use separate recordings subdomain
            $possibleUrls[] = "https://recordings.{$jitsiDomain}/{$meetingId}.{$format}";
        }
        
        // Check without specific format (might redirect to actual file)
        $possibleUrls[] = "https://{$jitsiDomain}/recordings/{$meetingId}";

        Log::info("Checking for Jibri recording", [
            'meeting_id' => $meetingId,
            'total_urls_to_check' => count($possibleUrls)
        ]);

        // Try to find which URL works
        foreach ($possibleUrls as $url) {
            try {
                $response = Http::timeout(10)->head($url);
                
                if ($response->successful()) {
                    // Verify it's actually a video file
                    $contentType = $response->header('Content-Type') ?? '';
                    $contentLength = $response->header('Content-Length') ?? 0;
                    
                    // Check if it's a video file or has reasonable size
                    if (strpos($contentType, 'video') !== false || 
                        strpos($contentType, 'application/octet-stream') !== false ||
                        ($contentLength > 1024)) { // At least 1KB
                        
                        Log::info("Found Jibri recording URL", [
                            'url' => $url,
                            'meeting_id' => $meetingId,
                            'content_type' => $contentType,
                            'content_length' => $contentLength
                        ]);
                        return $url;
                    } else {
                        Log::debug("URL exists but is not a video", [
                            'url' => $url,
                            'content_type' => $contentType,
                            'content_length' => $contentLength
                        ]);
                    }
                }
            } catch (Exception $e) {
                // Only log if it's not a simple connection error
                if (strpos($e->getMessage(), 'Could not resolve host') === false) {
                    Log::debug("Failed to check recording URL", [
                        'url' => $url,
                        'error' => $e->getMessage()
                    ]);
                }
                continue;
            }
        }

        Log::info("No Jibri recording found yet", [
            'meeting_id' => $meetingId,
            'note' => 'Jibri may still be processing the recording'
        ]);
        return null;
    }

    /**
     * Download recording from URL and store it locally
     */
    protected function downloadAndStoreRecording(string $recordingUrl, string $appointmentUuid): ?string
    {
        try {
            // Create directory if it doesn't exist
            $directory = 'recordings/' . date('Y/m');
            if (!Storage::disk('public')->exists($directory)) {
                Storage::disk('public')->makeDirectory($directory);
            }

            // Generate filename with appointment UUID
            $filename = $appointmentUuid . '_' . time() . '.mp4';
            $filePath = $directory . '/' . $filename;

            Log::info("Starting recording download", [
                'url' => $recordingUrl,
                'file_path' => $filePath
            ]);

            // Download the file in chunks to handle large files
            $response = Http::timeout(600)->get($recordingUrl);
            
            if (!$response->successful()) {
                Log::error("Failed to download recording - HTTP error", [
                    'url' => $recordingUrl,
                    'status' => $response->status()
                ]);
                return null;
            }

            // Verify content type
            $contentType = $response->header('Content-Type') ?? '';
            if (strpos($contentType, 'video') === false && strpos($contentType, 'application/octet-stream') === false) {
                Log::warning("Downloaded file is not a video", [
                    'url' => $recordingUrl,
                    'content_type' => $contentType,
                    'file_size' => strlen($response->body())
                ]);
                // Still save it, but log a warning
            }

            // Store the file
            Storage::disk('public')->put($filePath, $response->body());

            // Verify file was saved
            if (Storage::disk('public')->exists($filePath)) {
                $fileSize = Storage::disk('public')->size($filePath);
                Log::info("Recording downloaded and stored successfully", [
                    'file_path' => $filePath,
                    'file_size' => $fileSize
                ]);
                return $filePath;
            }

            return null;

        } catch (Exception $e) {
            Log::error("Failed to download and store recording", [
                'url' => $recordingUrl,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return null;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(Exception $exception): void
    {
        Log::error('DownloadMeetingRecordingJob failed permanently', [
            'appointment_uuid' => $this->appointmentUuid,
            'error' => $exception->getMessage()
        ]);
    }
}
