<?php

namespace App\Services;

use App\Models\Consultation;
use App\common\ConsultationDTO;
use App\Interfaces\ServiceInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Exception;

class ConsultationService implements ServiceInterface
{
    /**
     * Get all consultations with optional pagination
     */
    public function getAll(int $perPage = 15): LengthAwarePaginator
    {
        return Consultation::with(['appointment', 'veterinary', 'pet'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    /**
     * Get consultation by ID
     */
    public function getById(int $id): ?Consultation
    {
        return Consultation::with(['appointment', 'veterinary', 'pet'])->find($id);
    }

    /**
     * Get consultation by UUID
     */
    public function getByUuid(string $uuid): ?Consultation
    {
        return Consultation::with(['appointment', 'veterinary', 'pet'])
            ->where('uuid', $uuid)
            ->first();
    }

    /**
     * Create new consultation from DTO
     */
    public function create(ConsultationDTO $dto): Consultation
    {
        try {
            $consultation = Consultation::create($dto->toCreateArray());
            return $consultation->load(['appointment', 'veterinary', 'pet']);
        } catch (Exception $e) {
            throw new Exception("Failed to create consultation: " . $e->getMessage());
        }
    }

    /**
     * Update consultation by UUID from DTO
     */
    public function update(string $uuid, ConsultationDTO $dto): ?Consultation
    {
        try {
            $consultation = $this->getByUuid($uuid);
            
            if (!$consultation) {
                return null;
            }

            $updateData = $dto->toUpdateArray();
            
            if (empty($updateData)) {
                return $consultation;
            }

            $consultation->update($updateData);
            return $consultation->fresh(['appointment', 'veterinary', 'pet']);
        } catch (Exception $e) {
            throw new Exception("Failed to update consultation: " . $e->getMessage());
        }
    }

    /**
     * Delete consultation by UUID
     */
    public function delete(string $uuid): bool
    {
        try {
            $consultation = $this->getByUuid($uuid);
            
            if (!$consultation) {
                return false;
            }

            return $consultation->delete();
        } catch (Exception $e) {
            throw new Exception("Failed to delete consultation: " . $e->getMessage());
        }
    }

    /**
     * Search consultations by diagnosis
     */
    public function searchByDiagnosis(string $diagnosis, int $perPage = 15): LengthAwarePaginator
    {
        return Consultation::with(['appointment', 'veterinary', 'pet'])
            ->where('diagnosis', 'LIKE', "%{$diagnosis}%")
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    /**
     * Get consultations by pet ID
     */
    public function getByPetId(int $petId, int $perPage = 15): LengthAwarePaginator
    {
        return Consultation::with(['veterinary', 'appointment'])
            ->where('pet_id', $petId)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    /**
     * Get consultations by veterinary ID
     */
    public function getByVeterinaryId(int $veterinaryId, int $perPage = 15): LengthAwarePaginator
    {
        return Consultation::with(['pet', 'appointment'])
            ->where('veterinary_id', $veterinaryId)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }
}
