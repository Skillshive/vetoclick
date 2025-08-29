<?php

namespace App\Services;

use App\Models\Breed;
use App\common\BreedDTO;
use App\Interfaces\ServiceInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Exception;

class BreedService implements ServiceInterface
{
    /**
     * Get all breeds with optional pagination
     */
    public function getAll(int $perPage = 15): LengthAwarePaginator
    {
        return Breed::with('species')->paginate($perPage);
    }

    /**
     * Get breed by ID
     */
    public function getById(int $id): ?Breed
    {
        return Breed::with('species')->find($id);
    }

    /**
     * Get breed by UUID
     */
    public function getByUuid(string $uuid): ?Breed
    {
        return Breed::with('species')->where('uuid', $uuid)->first();
    }

    /**
     * Create new breed from DTO
     */
    public function create(BreedDTO $dto): Breed
    {
        try {
            $breed = Breed::create($dto->toCreateArray());
            return $breed->load('species');
        } catch (Exception $e) {
            throw new Exception("Failed to create breed: " . $e->getMessage());
        }
    }

    /**
     * Update breed by UUID from DTO
     */
    public function update(string $uuid, BreedDTO $dto): ?Breed
    {
        try {
            $breed = $this->getByUuid($uuid);
            
            if (!$breed) {
                return null;
            }

            $updateData = $dto->toUpdateArray();
            
            if (empty($updateData)) {
                return $breed;
            }

            $breed->update($updateData);
            return $breed->fresh(['species']);
        } catch (Exception $e) {
            throw new Exception("Failed to update breed: " . $e->getMessage());
        }
    }

    /**
     * Delete breed by UUID
     */
    public function delete(string $uuid): bool
    {
        try {
            $breed = $this->getByUuid($uuid);
            
            if (!$breed) {
                return false;
            }

            return $breed->delete();
        } catch (Exception $e) {
            throw new Exception("Failed to delete breed: " . $e->getMessage());
        }
    }

    /**
     * Search breeds by name
     */
    public function searchByName(string $name, int $perPage = 15): LengthAwarePaginator
    {
        return Breed::with('species')
            ->where('name', 'LIKE', "%{$name}%")
            ->paginate($perPage);
    }

    /**
     * Get breeds by species ID
     */
    public function getBySpeciesId(int $speciesId, int $perPage = 15): LengthAwarePaginator
    {
        return Breed::with('species')
            ->where('species_id', $speciesId)
            ->paginate($perPage);
    }
}
