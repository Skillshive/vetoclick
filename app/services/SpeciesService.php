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
    public function getAll(?int $perPage = 15)
    {
        if ($perPage === null || $perPage === 0) {
            // Return all records without pagination
            return Species::with('image')->get();
        }
        return Species::with('image')->paginate($perPage);
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
        return Species::with(['image', 'breeds'])->where('uuid', $uuid)->first();
    }

    /**
     * Create new species from DTO
     */
    public function create(SpeciesDto $dto, $request = null): Species
    {
        try {
            $createData = $dto->toCreateArray();

            // Handle image upload if present
            if ($request && $request->hasFile('image')) {
                $imageService = app(ImageService::class);
                $image = $imageService->saveImage($request->file('image'), 'species/');
                $createData['image_id'] = $image->id;
            }

            $species = Species::create($createData);
            return $species;
        } catch (Exception $e) {
            throw new Exception("Failed to create species: " . $e->getMessage());
        }
    }

    /**
     * Update species by UUID from DTO
     */
    public function update(string $uuid, SpeciesDto $dto, $request = null): ?Species
    {
        try {
            $species = $this->getByUuid($uuid);

            if (!$species) {
                return null;
            }

            $updateData = $dto->toUpdateArray();

            // Handle image upload if present
            if ($request && $request->hasFile('image')) {
                $imageService = app(ImageService::class);
                $species = $imageService->update($species, $request->file('image'));
                // Remove image_id from updateData since it's already handled
                unset($updateData['image_id']);
            }

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
    public function searchByName(string $name, ?int $perPage = 15)
    {
        $query = Species::with('image')
            ->where('name', 'LIKE', "%{$name}%");

        if ($perPage === null || $perPage === 0) {
            // Return all records without pagination
            return $query->get();
        }
        return $query->paginate($perPage);
    }
}
