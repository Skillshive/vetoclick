<?php

namespace App\Services;

use App\Models\Appointment;
use App\common\AppointmentDTO;
use App\Interfaces\ServiceInterface;
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

    /**
     * Create new appointment from DTO
     */
    public function create(AppointmentDTO $dto): Appointment
    {
        try {
            $this->checkForConflicts($dto->toCreateArray());
            $appointment = Appointment::create($dto->toCreateArray());
            return $appointment->load(['client.user', 'pet', 'veterinary']);
        } catch (Exception $e) {
            throw new Exception("Failed to create appointment: " . $e->getMessage());
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

            $updateData = $dto->toUpdateArray();
            
            if (empty($updateData)) {
                return $appointment;
            }

            // Check for conflicts if time or veterinary changed
            if (isset($updateData['start_time']) || isset($updateData['end_time']) || isset($updateData['veterinary_id'])) {
                $this->checkForConflicts($updateData, $appointment->id);
            }

            $appointment->update($updateData);
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

    /**
     * Check for scheduling conflicts
     */
    protected function checkForConflicts(array $data, ?int $excludeAppointmentId = null): void
    {
        if (!isset($data['veterinary_id']) || !isset($data['start_time']) || !isset($data['end_time'])) {
            return;
        }

        $isAvailable = $this->checkAvailability(
            $data['veterinary_id'],
            $data['start_time'],
            $data['end_time'],
            $excludeAppointmentId
        );

        if (!$isAvailable) {
            throw new Exception('The selected time slot is not available for the chosen veterinary.');
        }
    }
}
