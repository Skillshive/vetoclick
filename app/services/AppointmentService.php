<?php

namespace App\Services;

use App\Models\Appointment;
use App\common\AppointmentDTO;
use App\Interfaces\ServiceInterface;
use App\Models\Client;
use App\Models\Pet;
use App\Models\Veterinary;
use Illuminate\Pagination\LengthAwarePaginator;
use Exception;
use Carbon\Carbon;

class AppointmentService implements ServiceInterface
{
    protected $jitsiMeetService;

    public function __construct(JitsiMeetService $jitsiMeetService = null)
    {
        $this->jitsiMeetService = $jitsiMeetService ?? new JitsiMeetService();
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
    public function create(AppointmentDTO $dto): Appointment
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
        
        $appointment= Appointment::create([
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

        // Generate Jitsi Meet link for the appointment
        $this->generateJitsiMeetingLink($appointment);

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
            $appointmentDate = $appointment->appointment_date instanceof \Carbon\Carbon 
                ? $appointment->appointment_date->format('Y-m-d')
                : (is_string($appointment->appointment_date) ? $appointment->appointment_date : \Carbon\Carbon::parse($appointment->appointment_date)->format('Y-m-d'));
            
            // Handle time format (stored as time string H:i:s or H:i)
            $startTime = is_string($appointment->start_time) 
                ? substr($appointment->start_time, 0, 5) // Get HH:MM from HH:MM:SS
                : \Carbon\Carbon::parse($appointment->start_time)->format('H:i');
            
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
            // Log the error but don't fail the appointment creation
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
            throw new Exception("Failed to update appointment: " . $e->getMessage());
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
            throw new Exception("Failed to delete appointment: " . $e->getMessage());
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
            throw new Exception("Failed to cancel appointment: " . $e->getMessage());
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
            throw new Exception("Failed to report appointment: " . $e->getMessage());
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
    public function checkAvailability(int $veterinaryId, string $startTime, string $endTime, ?int $excludeAppointmentId = null): bool
    {
        $query = Appointment::where('veterinary_id', $veterinaryId)
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
        $query = Appointment::with(['client', 'pet.breed.species', 'veterinary'])
            ->whereDate('appointment_date', Carbon::today())
            ->where('status', '!=', 'cancelled')
            ->orderBy('start_time', 'asc');

        if ($veterinaryId) {
            $query->where('veterinarian_id', $veterinaryId);
        }

        return $query->get();
    }
}
