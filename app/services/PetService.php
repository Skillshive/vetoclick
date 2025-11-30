<?php

namespace App\Services;

use App\common\PetDTO;
use App\Models\Pet;
use App\Interfaces\ServiceInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Exception;

class PetService implements ServiceInterface
{
    /**
     * Get all pets with optional pagination
     */
    public function getAll(int $perPage = 15): LengthAwarePaginator
    {
        return Pet::with(['client.user', 'species', 'breed'])->paginate($perPage);
    }

    /**
     * Get pet by ID
     */
    public function getById(int $id): ?Pet
    {
        return Pet::with(['client.user', 'species', 'breed'])->find($id);
    }

    /**
     * Get pet by UUID
     */
    public function getByUuid(string $uuid): ?Pet
    {
        return Pet::with(['client.user', 'species', 'breed'])
                 ->where('uuid', $uuid)
                 ->first();
    }

    /**
     * Create new pet from DTO
     */
    public function create(PetDTO $dto): Pet
    {
        try {
            $pet = Pet::create($dto->toCreateArray());
            return $pet->load(['client.user', 'species', 'breed']);
        } catch (Exception $e) {
            throw new Exception("Failed to create pet: " . $e->getMessage());
        }
    }

    /**
     * Update pet by UUID from DTO
     */
    public function update(string $uuid, PetDTO $dto): ?Pet
    {
        try {
            $pet = $this->getByUuid($uuid);
            
            if (!$pet) {
                return null;
            }

            $updateData = $dto->toUpdateArray();
            
            if (empty($updateData)) {
                return $pet;
            }

            $pet->update($updateData);
            return $pet->fresh(['client.user', 'species', 'breed']);
        } catch (Exception $e) {
            throw new Exception("Failed to update pet: " . $e->getMessage());
        }
    }

    /**
     * Delete pet by UUID
     */
    public function delete(string $uuid): bool
    {
        try {
            $pet = $this->getByUuid($uuid);
            
            if (!$pet) {
                return false;
            }

            return $pet->delete();
        } catch (Exception $e) {
            throw new Exception("Failed to delete pet: " . $e->getMessage());
        }
    }

    /**
     * Search pets by name
     */
    public function searchByName(string $name, int $perPage = 15): LengthAwarePaginator
    {
        return Pet::with(['client.user', 'species', 'breed'])
            ->where('name', 'LIKE', "%{$name}%")
            ->paginate($perPage);
    }

    /**
     * Get pets by client ID
     */
    public function getByClientId(int $clientId, int $perPage = 15): LengthAwarePaginator
    {
        return Pet::with(['species', 'breed'])
            ->where('client_id', $clientId)
            ->paginate($perPage);
    }

    /**
     * Get pets by client UUID
     */
    public function getByClientUuid(string $clientUuid)
    {
        return Pet::with([ 'breed'])
            ->whereHas('client', function ($query) use ($clientUuid) {
                $query->where('uuid', $clientUuid);
            })
            ->get();
    }

    /**
     * Get pets by species ID
     */
    public function getBySpeciesId(int $speciesId, int $perPage = 15): LengthAwarePaginator
    {
        return Pet::with(['client.user', 'breed'])
            ->where('species_id', $speciesId)
            ->paginate($perPage);
    }
}