<?php

namespace App\Services;

use App\Models\Appointment;
use App\common\AppointmentDTO;
use App\Interfaces\ServiceInterface;
use App\Models\Client;
use App\Models\Pet;
use App\Models\Veterinary;
use App\Services\AvailabilityService;
use Illuminate\Pagination\LengthAwarePaginator;
use Exception;
use Carbon\Carbon;

class AppointmentService implements ServiceInterface
{
    protected $jitsiMeetService;
    protected $availabilityService;

    public function __construct(JitsiMeetService $jitsiMeetService = null, AvailabilityService $availabilityService = null)
    {
        $this->jitsiMeetService = $jitsiMeetService ?? new JitsiMeetService();
        $this->availabilityService = $availabilityService ?? new AvailabilityService();
    }
    /**
     * Get all appointments with optional pagination
     */
    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $perPage = $filters['per_page'] ?? 15;
        $query = Appointment::with(['client', 'pet', 'veterinary']);

        if (!empty($filters['status'])) {
            $statusValues = is_array($filters['status']) ? $filters['status'] : explode(',', $filters['status']);
            $statusValues = array_map('intval', $statusValues);
            $query->whereIn('status', $statusValues);
        }

        if (!empty($filters['client'])) {
            $clientIds = is_array($filters['client']) ? $filters['client'] : explode(',', $filters['client']);
            $query->whereIn('client_id', $clientIds);
        }

        if (!empty($filters['search'])) {
            $this->applySearch($query, $filters['search']);
        }

        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortDirection = $filters['sort_direction'] ?? 'desc';
        $query->orderBy($sortBy, $sortDirection);

        return $query->paginate($perPage);
    }

    /**
     * Get appointment by ID
     */
    public function getById(int $id): ?Appointment
    {
        return Appointment::with(['client', 'pet', 'veterinary'])->find($id);
    }

    /**
     * Get appointment by UUID
     */
    public function getByUuid(string $uuid): ?Appointment
    {
        return Appointment::with(['client', 'pet', 'veterinary'])
            ->where('uuid', $uuid)
            ->first();
    }

    private function getClient(string $clientId){
        $client = Client::where('uuid',$clientId)->first();

        if($client){
            return $client->id;
        }
        return null;
    } 
    private function getPet($petId){
        $pet = Pet::where('uuid',$petId)->first();

        if($pet){
            return $pet->id;
        }
        return null;
    } 
    private function getVet(string $vetId){
        $vet = Veterinary::where('uuid',$vetId)->first();

        if($vet){
            return $vet->id;
        }
        return null;
    } 

    /**
     * Create new appointment from DTO
     */
    public function create(AppointmentDTO $dto, bool $skipValidation = false): Appointment
    {
        // Calculate end_time and duration_minutes (default 30 minutes)
        $defaultDurationMinutes = 30;
        $startTime = Carbon::createFromFormat('H:i', $dto->start_time);
        $endTime = $startTime->copy()->addMinutes($defaultDurationMinutes);
        
        // Convert is_video_conseil to boolean
        $isVideoConseil = filter_var($dto->is_video_conseil, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
        if ($isVideoConseil === null) {
            $isVideoConseil = false; // Default to false if not provided or invalid
        }
        
        // Determine veterinarian_id - use provided vet ID or fall back to authenticated user's vet ID
        $veterinarianId = null;
        $veterinarianUuid = null;
        if (!empty($dto->veterinarian_id)) {
            $veterinarianUuid = $dto->veterinarian_id;
            $veterinarianId = $this->getVet($dto->veterinarian_id);
        }
        
        // If still no vet ID, try authenticated user (for vet users creating appointments)
        if (!$veterinarianId && auth()->check() && auth()->user()->veterinary) {
            $veterinarianId = auth()->user()->veterinary->id;
            $veterinarianUuid = auth()->user()->veterinary->uuid;
        }
        
        if (!$veterinarianId) {
            throw new Exception('Veterinarian ID is required');
        }
        
        // Validate appointment request if not skipped (for admin/internal use)
        if (!$skipValidation && $veterinarianUuid) {
            $validation = $this->validateAppointmentRequest(
                $veterinarianUuid,
                $dto->appointment_date,
                $dto->start_time,
                $defaultDurationMinutes
            );
            
            if (!$validation['valid']) {
                throw new Exception($validation['message'] . '|' . json_encode($validation['suggestions']));
            }
        }
        
        $appointment= Appointment::create([
            "veterinarian_id"=> $veterinarianId,
            "client_id"=>$this->getClient($dto->client_id),
            "pet_id"=>$this->getPet($dto->pet_id),
            "appointment_type"=>$dto->appointment_type,
            "appointment_date"=>$dto->appointment_date,
            "start_time"=>$dto->start_time,
            "end_time"=>$endTime->format('H:i:s'),
            "duration_minutes"=>$defaultDurationMinutes,
            "is_video_conseil"=>$isVideoConseil,
            "reason_for_visit"=>$dto->reason_for_visit,
            "appointment_notes"=>$dto->appointment_notes,
            "status"=>auth()->user()->hasRole('veterinarian') ? 'scheduled' : 'confirmed',
        ]);

        // Generate Jitsi Meet link for the appointment
        $this->generateJitsiMeetingLink($appointment);

        return $appointment->load(['client', 'pet', 'veterinary']);
    }

    /**
     * Create appointment request from client (requires vet approval)
     * Status is set to 'scheduled' (pending) instead of 'confirmed'
     */
    public function requestAppointment(AppointmentDTO $dto): Appointment
    {
        $defaultDurationMinutes = 30;
        $startTime = Carbon::createFromFormat('H:i', $dto->start_time);
        $endTime = $startTime->copy()->addMinutes($defaultDurationMinutes);
        
        // Convert is_video_conseil to boolean
        $isVideoConseil = filter_var($dto->is_video_conseil, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
        if ($isVideoConseil === null) {
            $isVideoConseil = false;
        }
        
        $appointment = Appointment::create([
            "veterinarian_id" => $this->getVet($dto->veterinarian_id),
            "client_id" => $this->getClient($dto->client_id),
            "pet_id" => $this->getPet($dto->pet_id),
            "appointment_type" => $dto->appointment_type,
            "appointment_date" => $dto->appointment_date,
            "start_time" => $dto->start_time,
            "end_time" => $endTime->format('H:i:s'),
            "duration_minutes" => $defaultDurationMinutes,
            "status" => 'scheduled', // Pending vet approval
            "is_video_conseil" => $isVideoConseil,
            "reason_for_visit" => $dto->reason_for_visit,
            "appointment_notes" => $dto->appointment_notes,
        ]);

        if ($isVideoConseil) {
            $this->generateJitsiMeetingLink($appointment);
        }

        return $appointment->load(['client', 'pet', 'veterinary']);
    }

    
    /**
     * Generate and store Jitsi Meet link for an appointment
     *
     * @param Appointment $appointment
     * @return void
     */
    private function generateJitsiMeetingLink(Appointment $appointment): void
    {
        try {
            $clientName = null;
            $petName = null;

            // Load relationships if not already loaded
            if (!$appointment->relationLoaded('client')) {
                $appointment->load('client');
            }
            if (!$appointment->relationLoaded('pet')) {
                $appointment->load('pet');
            }

            // Get client and pet names for better meeting experience
            if ($appointment->client) {
                $clientName = trim(($appointment->client->first_name ?? '') . ' ' . ($appointment->client->last_name ?? ''));
                $clientName = trim($clientName) ?: null;
            }
            if ($appointment->pet && isset($appointment->pet->name)) {
                $petName = $appointment->pet->name;
            }

            // Generate the Jitsi Meet link based on appointment date and time
            // Handle date format
            $appointmentDate = $appointment->appointment_date instanceof Carbon 
                ? $appointment->appointment_date->format('Y-m-d')
                : (is_string($appointment->appointment_date) ? $appointment->appointment_date : Carbon::parse($appointment->appointment_date)->format('Y-m-d'));
            
            // Handle time format (stored as time string H:i:s or H:i)
            $startTime = is_string($appointment->start_time) 
                ? substr($appointment->start_time, 0, 5) // Get HH:MM from HH:MM:SS
                : Carbon::parse($appointment->start_time)->format('H:i');
            
            // Set redirect URL when user leaves the meeting (configurable via config)
            $redirectUrl = config('services.jitsi.redirect_url', '/dashboard');
            if (!filter_var($redirectUrl, FILTER_VALIDATE_URL)) {
                $redirectUrl = url($redirectUrl);
            }
            
            $meetingInfo = $this->jitsiMeetService->generateMeetingLink(
                $appointment->uuid,
                $appointmentDate,
                $startTime,
                $clientName,
                $petName,
                $redirectUrl
            );

            // Update the appointment with the meeting information
            $appointment->update([
                'video_meeting_id' => $meetingInfo['meeting_id'],
                'video_join_url' => $meetingInfo['join_url'],
            ]);

            // Refresh the appointment to get updated attributes
            $appointment->refresh();
        } catch (Exception $e) {
            \Illuminate\Support\Facades\Log::error('Failed to generate Jitsi Meet link: ' . $e->getMessage());
        }
    }

    /**
     * Update appointment by UUID from DTO
     */
    public function update(string $uuid, AppointmentDTO $dto): ?Appointment
    {
        try {
            $appointment = $this->getByUuid($uuid);
            
            if (!$appointment) {
                return null;
            }

            // Calculate end_time and duration_minutes if start_time is being updated
            $defaultDurationMinutes = 30;
            $startTime = Carbon::createFromFormat('H:i', $dto->start_time);
            $endTime = $startTime->copy()->addMinutes($defaultDurationMinutes);

            // Convert is_video_conseil to boolean
            $isVideoConseil = filter_var($dto->is_video_conseil, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
            if ($isVideoConseil === null) {
                $isVideoConseil = false; // Default to false if not provided or invalid
            }

            $updateData = $appointment->update([
            "veterinarian_id"=>$this->getVet($dto->veterinarian_id),
            "client_id"=>$this->getClient($dto->client_id),
            "pet_id"=>$this->getPet($dto->pet_id),
            "appointment_type"=>$dto->appointment_type,
            "appointment_date"=>$dto->appointment_date,
            "start_time"=>$dto->start_time,
            "end_time"=>$endTime->format('H:i:s'),
            "duration_minutes"=>$defaultDurationMinutes,
            "is_video_conseil"=>$isVideoConseil,
            "reason_for_visit"=>$dto->reason_for_visit,
            "appointment_notes"=>$dto->appointment_notes,
        ]);
            
            if (empty($updateData)) {
                return $appointment;
            }

            return $appointment->fresh(['client', 'pet', 'veterinary']);
        } catch (Exception $e) {
            throw new Exception("Failed to update appointment");
        }
    }

    /**
     * Delete appointment by UUID
     */
    public function delete(string $uuid): bool
    {
        try {
            $appointment = $this->getByUuid($uuid);
            
            if (!$appointment) {
                return false;
            }

            return $appointment->delete();
        } catch (Exception $e) {
            throw new Exception("Failed to delete appointment");
        }
    }

    public function cancel(string $uuid): bool
    {
        try {
            $appointment = $this->getByUuid($uuid);
            
            if (!$appointment) {
                return false;
            }

            $appointment->status = 'cancelled';
            return $appointment->save();
        } catch (Exception $e) {
            throw new Exception("Failed to cancel appointment");
        }
    }

    public function report(string $uuid, AppointmentDTO $dto): ?Appointment
    {
        try {
            $appointment = $this->getByUuid($uuid);
            
            if (!$appointment) {
                return null;
            }

            $updateData = [
                'appointment_date' => $dto->appointment_date,
                'start_time' => $dto->start_time,
            ];
            
            $appointment->update($updateData);
            
            return $appointment->fresh(['client', 'pet', 'veterinary']);
        } catch (Exception $e) {
            throw new Exception("Failed to report appointment");
        }
    }

    /**
     * Search appointments by title
     */
    public function searchByTitle(string $title, int $perPage = 15): LengthAwarePaginator
    {
        return Appointment::with(['client', 'pet', 'veterinary'])
            ->where('title', 'LIKE', "%{$title}%")
            ->orderBy('start_time', 'asc')
            ->paginate($perPage);
    }

    /**
     * Get appointments by client ID
     */
    public function getByClientId(int $clientId, int $perPage = 15): LengthAwarePaginator
    {
        return Appointment::with(['pet', 'veterinary'])
            ->where('client_id', $clientId)
            ->orderBy('start_time', 'asc')
            ->paginate($perPage);
    }

    /**
     * Get appointments by veterinary ID
     */
    public function getByVeterinaryId(int $veterinaryId, int $perPage = 15): LengthAwarePaginator
    {
        return Appointment::with(['client', 'pet'])
            ->where('veterinary_id', $veterinaryId)
            ->orderBy('start_time', 'asc')
            ->paginate($perPage);
    }

    /**
     * Check availability for appointment scheduling
     */
    public function checkAvailability(int $veterinaryId, string $appointmentDate, string $startTime, string $endTime, ?int $excludeAppointmentId = null): bool
    {
        $query = Appointment::where('veterinarian_id', $veterinaryId)
            ->where('appointment_date', $appointmentDate)
            ->where('status', '!=', 'cancelled')
            ->where(function($q) use ($startTime, $endTime) {
                $q->whereBetween('start_time', [$startTime, $endTime])
                  ->orWhereBetween('end_time', [$startTime, $endTime])
                  ->orWhere(function($q) use ($startTime, $endTime) {
                      $q->where('start_time', '<=', $startTime)
                        ->where('end_time', '>=', $endTime);
                  });
            });

        if ($excludeAppointmentId) {
            $query->where('id', '!=', $excludeAppointmentId);
        }

        return $query->count() === 0;
    }

    /**
     * Validate appointment request and check availability
     * Returns array with 'valid' boolean and 'message' string, and optionally 'suggestions' array
     */
    public function validateAppointmentRequest(string $veterinarianId, string $appointmentDate, string $startTime, int $durationMinutes = 30): array
    {
        $veterinarian = Veterinary::where('uuid', $veterinarianId)->first();
        
        if (!$veterinarian) {
            return [
                'valid' => false,
                'message' => __('common.veterinarian_not_found'),
                'suggestions' => []
            ];
        }

        $veterinarianIdInt = $veterinarian->id;
        
        // Parse appointment date to get day of week
        $appointmentDateCarbon = Carbon::parse($appointmentDate);
        $dayOfWeek = strtolower($appointmentDateCarbon->format('l')); // monday, tuesday, etc.
        
        // Format time for availability check
        $startTimeFormatted = Carbon::createFromFormat('H:i', $startTime)->format('H:i:s');
        $endTime = Carbon::createFromFormat('H:i', $startTime)->addMinutes($durationMinutes);
        $endTimeFormatted = $endTime->format('H:i:s');
        
        // Check if vet has availability set for this day and time
        $isAvailable = $this->availabilityService->isVeterinaryAvailable(
            $veterinarianIdInt,
            $dayOfWeek,
            $startTimeFormatted
        );
        
        if (!$isAvailable) {
            // Get suggestions for available times
            $suggestions = $this->getAvailableTimeSuggestions($veterinarianIdInt, $appointmentDate, $durationMinutes);
            
            return [
                'valid' => false,
                'message' => __('common.veterinarian_not_available_at_requested_time'),
                'suggestions' => $suggestions
            ];
        }
        
        // Check for conflicting appointments
        $hasConflict = !$this->checkAvailability(
            $veterinarianIdInt,
            $appointmentDate,
            $startTimeFormatted,
            $endTimeFormatted
        );
        
        if ($hasConflict) {
            // Get suggestions for available times
            $suggestions = $this->getAvailableTimeSuggestions($veterinarianIdInt, $appointmentDate, $durationMinutes);
            
            return [
                'valid' => false,
                'message' => __('common.appointment_time_conflict'),
                'suggestions' => $suggestions
            ];
        }
        
        return [
            'valid' => true,
            'message' => __('common.appointment_time_available'),
            'suggestions' => []
        ];
    }

    /**
     * Get available time suggestions for a veterinarian on a specific date
     * 
     * @param int $veterinarianId
     * @param string $appointmentDate (Y-m-d format)
     * @param int $durationMinutes Default 30 minutes
     * @param int $maxSuggestions Maximum number of suggestions to return
     * @return array Array of available time slots in H:i format
     */
    public function getAvailableTimeSuggestions(int $veterinarianId, string $appointmentDate, int $durationMinutes = 30, int $maxSuggestions = 10): array
    {
        $appointmentDateCarbon = Carbon::parse($appointmentDate);
        $dayOfWeek = strtolower($appointmentDateCarbon->format('l'));
        
        // Get vet's availability slots for this day
        $availabilitySlots = $this->availabilityService->getAvailableSlots($veterinarianId, $dayOfWeek);
        
        if ($availabilitySlots->isEmpty()) {
            return [];
        }
        
        // Get existing appointments for this date
        $existingAppointments = Appointment::where('veterinarian_id', $veterinarianId)
            ->where('appointment_date', $appointmentDate)
            ->where('status', '!=', 'cancelled')
            ->get()
            ->map(function($apt) {
                return [
                    'start' => Carbon::parse($apt->start_time)->format('H:i'),
                    'end' => Carbon::parse($apt->end_time)->format('H:i'),
                ];
            })
            ->toArray();
        
        $suggestions = [];
        
        // Generate time slots from availability
        foreach ($availabilitySlots as $slot) {
            // Skip breaks
            if ($slot->is_break ?? false) {
                continue;
            }
            
            $slotStart = Carbon::parse($slot->start_time);
            $slotEnd = Carbon::parse($slot->end_time);
            
            // Generate 30-minute slots within this availability window
            $currentTime = $slotStart->copy();
            
            while ($currentTime->copy()->addMinutes($durationMinutes)->lte($slotEnd)) {
                $timeSlotStart = $currentTime->format('H:i');
                $timeSlotEnd = $currentTime->copy()->addMinutes($durationMinutes)->format('H:i');
                
                // Check if this time slot conflicts with existing appointments
                $hasConflict = false;
                foreach ($existingAppointments as $existing) {
                    $existingStart = Carbon::parse($existing['start']);
                    $existingEnd = Carbon::parse($existing['end']);
                    $slotStartCarbon = Carbon::parse($timeSlotStart);
                    $slotEndCarbon = Carbon::parse($timeSlotEnd);
                    
                    // Check for overlap
                    if ($slotStartCarbon->lt($existingEnd) && $slotEndCarbon->gt($existingStart)) {
                        $hasConflict = true;
                        break;
                    }
                }
                
                // Also check if time is not in the past (if appointment date is today)
                $isInPast = false;
                if ($appointmentDateCarbon->isToday()) {
                    $now = Carbon::now();
                    $slotDateTime = $appointmentDateCarbon->copy()->setTimeFromTimeString($timeSlotStart);
                    if ($slotDateTime->lt($now)) {
                        $isInPast = true;
                    }
                }
                
                if (!$hasConflict && !$isInPast) {
                    $suggestions[] = $timeSlotStart;
                    
                    if (count($suggestions) >= $maxSuggestions) {
                        break 2; // Break out of both loops
                    }
                }
                
                // Move to next slot (use duration as interval, with minimum 15 minutes)
                $interval = max($durationMinutes, 15);
                $currentTime->addMinutes($interval);
            }
            
            if (count($suggestions) >= $maxSuggestions) {
                break;
            }
        }
        
        return $suggestions;
    }


    private function applySearch($query, $search)
    {
        $query->where(function ($q) use ($search) {
            $q->where('reason_for_visit', 'LIKE', "%{$search}%");
        });
    }

    public function search(string $query, int $perPage = 15): LengthAwarePaginator
    {
        $queryBuilder = Appointment::with(['pet', 'veterinary', 'client']);
        $this->applySearch($queryBuilder, $query);
        return $queryBuilder->paginate($perPage);
    }

    /**
     * Get today's appointments for a specific veterinary
     *
     * @param int|null $veterinaryId Optional veterinary ID to filter by
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getTodayAppointments(?int $veterinaryId = null): \Illuminate\Database\Eloquent\Collection
    {
        $query = Appointment::with(['client', 'pet.breed.species', 'veterinary', 'consultation'])
            ->whereDate('appointment_date', Carbon::today())
            ->where('status', '!=', 'cancelled')
            ->orderBy('start_time', 'asc');

        if ($veterinaryId) {
            $query->where('veterinarian_id', $veterinaryId);
        }

        return $query->get();
    }

    /**
     * Get upcoming appointments for a specific client
     *
     * @param int $clientId Client ID
     * @param int $limit Number of appointments to return
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getUpcomingByClientId(int $clientId, int $limit = 10): \Illuminate\Database\Eloquent\Collection
    {
        $today = Carbon::today();
        
        return Appointment::with(['pet', 'veterinary'])
            ->where('client_id', $clientId)
            ->where('status', '!=', 'cancelled')
            ->where(function($query) use ($today) {
                $query->whereDate('appointment_date', '>', $today)
                      ->orWhere(function($q) use ($today) {
                          $q->whereDate('appointment_date', '=', $today)
                            ->whereTime('start_time', '>=', Carbon::now()->format('H:i:s'));
                      });
            })
            ->orderBy('appointment_date', 'asc')
            ->orderBy('start_time', 'asc')
            ->limit($limit)
            ->get();
    }

    /**
     * Get recent appointments for a specific client
     *
     * @param int $clientId Client ID
     * @param int $limit Number of appointments to return
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getRecentByClientId(int $clientId, int $limit = 10): \Illuminate\Database\Eloquent\Collection
    {
        $today = Carbon::today();
        
        return Appointment::with(['pet', 'veterinary'])
            ->where('client_id', $clientId)
            ->where(function($query) use ($today) {
                $query->whereDate('appointment_date', '<', $today)
                      ->orWhere(function($q) use ($today) {
                          $q->whereDate('appointment_date', '=', $today)
                            ->whereTime('start_time', '<', Carbon::now()->format('H:i:s'));
                      })
                      ->orWhere('status', 'completed');
            })
            ->orderBy('appointment_date', 'desc')
            ->orderBy('start_time', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Accept an appointment request (change status from scheduled to confirmed)
     * Checks vet availability before accepting
     *
     * @param string $uuid Appointment UUID
     * @return Appointment
     * @throws Exception
     */
    public function acceptAppointment(string $uuid): Appointment
    {
        $appointment = $this->getByUuid($uuid);
        
        if (!$appointment) {
            throw new Exception("Appointment not found");
        }

        if ($appointment->status !== 'scheduled') {
            throw new Exception("Only scheduled appointments can be accepted");
        }

        $appointmentDate = $appointment->appointment_date instanceof Carbon 
            ? $appointment->appointment_date
            : Carbon::parse($appointment->appointment_date);
        
        $startTime = is_string($appointment->start_time) 
            ? $appointment->start_time
            : Carbon::parse($appointment->start_time)->format('H:i:s');
        
        $endTime = is_string($appointment->end_time) 
            ? $appointment->end_time
            : Carbon::parse($appointment->end_time)->format('H:i:s');

        $dayOfWeek = strtolower($appointmentDate->format('l')); 

        $isAvailable = $this->availabilityService->isVeterinaryAvailable(
            $appointment->veterinarian_id,
            $dayOfWeek,
            $startTime
        );


        if (!$isAvailable) {
            throw new Exception("Veterinarian is not available at the requested time");
        }

        $hasConflict = !$this->checkAvailability(
            $appointment->veterinarian_id,
            $appointmentDate->format('Y-m-d'),
            $startTime,
            $endTime,
            $appointment->id
        );
        if ($hasConflict) {
            throw new Exception("There is a conflicting appointment at this time");
        }

        $appointment->status = 'confirmed';
        $appointment->save();

        if ($appointment->is_video_conseil && !$appointment->video_join_url) {
            $this->generateJitsiMeetingLink($appointment);
        }

        return $appointment->fresh(['client', 'pet', 'veterinary']);
    }

    /**
     * Get appointment statistics for a specific client
     *
     * @param int $clientId Client ID
     * @return array
     */
    public function getClientStatistics(int $clientId): array
    {
        $today = Carbon::today();
        
        $totalAppointments = Appointment::where('client_id', $clientId)->count();
        
        $upcomingAppointments = Appointment::where('client_id', $clientId)
            ->where('status', '!=', 'cancelled')
            ->where(function($query) use ($today) {
                $query->whereDate('appointment_date', '>', $today)
                      ->orWhere(function($q) use ($today) {
                          $q->whereDate('appointment_date', '=', $today)
                            ->whereTime('start_time', '>=', Carbon::now()->format('H:i:s'));
                      });
            })
            ->count();
        
        $completedAppointments = Appointment::where('client_id', $clientId)
            ->where('status', 'completed')
            ->count();
        
        $cancelledAppointments = Appointment::where('client_id', $clientId)
            ->where('status', 'cancelled')
            ->count();
        
        $videoConsultations = Appointment::where('client_id', $clientId)
            ->where('is_video_conseil', true)
            ->count();
        
        return [
            'totalAppointments' => $totalAppointments,
            'upcomingAppointments' => $upcomingAppointments,
            'completedAppointments' => $completedAppointments,
            'cancelledAppointments' => $cancelledAppointments,
            'videoConsultations' => $videoConsultations,
        ];
    }
}
