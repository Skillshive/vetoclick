<?php

namespace App\services;

use App\Models\Species;
use App\common\SpeciesDto;
use App\Interfaces\ServiceInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Exception;

class SpeciesService implements ServiceInterface
{
    /**
     * Get all species with optional pagination
     */
    public function getAll(int $perPage = 15): LengthAwarePaginator
    {
        return Species::paginate($perPage);
    }

    /**
     * Get species by ID
     */
    public function getById(int $id): ?Species
    {
        return Species::find($id);
    }

    /**
     * Get species by UUID
     */
    public function getByUuid(string $uuid): ?Species
    {
        return Species::where('uuid', $uuid)->first();
    }

    /**
     * Create new species from DTO
     */
    public function create(SpeciesDto $dto): Species
    {
        try {
            $species = Species::create($dto->toCreateArray());
            return $species;
        } catch (Exception $e) {
            throw new Exception("Failed to create species: " . $e->getMessage());
        }
    }

    /**
     * Update species by UUID from DTO
     */
    public function update(string $uuid, SpeciesDto $dto): ?Species
    {
        try {
            $species = $this->getByUuid($uuid);
            
            if (!$species) {
                return null;
            }

            $updateData = $dto->toUpdateArray();
            
            if (empty($updateData)) {
                return $species;
            }

            $species->update($updateData);
            return $species->fresh();
        } catch (Exception $e) {
            throw new Exception("Failed to update species: " . $e->getMessage());
        }
    }

    /**
     * Delete species by UUID
     */
    public function delete(string $uuid): bool
    {
        try {
            $species = $this->getByUuid($uuid);
            
            if (!$species) {
                return false;
            }

            return $species->delete();
        } catch (Exception $e) {
            throw new Exception("Failed to delete species: " . $e->getMessage());
        }
    }

    /**
     * Search species by name
     */
    public function searchByName(string $name, int $perPage = 15): LengthAwarePaginator
    {
        return Species::where('name', 'LIKE', "%{$name}%")
            ->paginate($perPage);
    }
}
