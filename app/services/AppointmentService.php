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

class AppointmentService implements ServiceInterface
{
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
    private function getPet(string $petId){
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

        $appointment= Appointment::create([
            "veterinarian_id"=>$this->getVet($dto->veterinarian_id),
            "client_id"=>$this->getClient($dto->client_id),
            "pet_id"=>$this->getPet($dto->pet_id),
            "appointment_type"=>$dto->appointment_type,
            "appointment_date"=>$dto->appointment_date,
            "start_time"=>$dto->start_time,
            "is_video_conseil"=>$dto->is_video_conseil,
            "reason_for_visit"=>$dto->reason_for_visit,
            "appointment_notes"=>$dto->appointment_notes,
        ]);

        return $appointment->load(['client', 'pet', 'veterinary']);
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

            $updateData = $appointment->update([
            "veterinarian_id"=>$this->getVet($dto->veterinarian_id),
            "client_id"=>$this->getClient($dto->client_id),
            "pet_id"=>$this->getPet($dto->pet_id),
            "appointment_type"=>$dto->appointment_type,
            "appointment_date"=>$dto->appointment_date,
            "start_time"=>$dto->start_time,
            "is_video_conseil"=>$dto->is_video_conseil,
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
}
