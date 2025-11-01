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
    public function getAll(int $perPage = 15): LengthAwarePaginator
    {
        return Appointment::with(['client.user', 'pet', 'veterinary'])
            ->orderBy('start_time', 'asc')
            ->paginate($perPage);
    }

    /**
     * Get appointment by ID
     */
    public function getById(int $id): ?Appointment
    {
        return Appointment::with(['client.user', 'pet', 'veterinary'])->find($id);
    }

    /**
     * Get appointment by UUID
     */
    public function getByUuid(string $uuid): ?Appointment
    {
        return Appointment::with(['client.user', 'pet', 'veterinary'])
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

        return $appointment->load(['client.user', 'pet', 'veterinary']);
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

            return $appointment->fresh(['client.user', 'pet', 'veterinary']);
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

    /**
     * Search appointments by title
     */
    public function searchByTitle(string $title, int $perPage = 15): LengthAwarePaginator
    {
        return Appointment::with(['client.user', 'pet', 'veterinary'])
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
        return Appointment::with(['client.user', 'pet'])
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


    public function search(string $query, int $perPage = 15): LengthAwarePaginator
    {
        return Appointment::with(['pet', 'veterinary',"client"])
            ->where('reason_for_visit', 'LIKE', "%{$query}%")
            ->orWhereHas('client', function ($q) use ($query) {
                $q->where('first_name', 'LIKE', '%' . $query . '%')
                ->orWhere('last_name', 'LIKE', '%' . $query . '%');
            })
            ->orWhereHas('veterinary.user', function ($q) use ($query) {
                $q->where('first_name', 'LIKE', '%' . $query . '%')
                ->orWhere('last_name', 'LIKE', '%' . $query . '%');
            })
            ->paginate($perPage);
    }
}
