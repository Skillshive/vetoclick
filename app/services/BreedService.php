<?php

namespace App\Services;

use App\common\BreedDTO;
use App\Models\Breed;
use App\Interfaces\ServiceInterface;
use App\Services\ImageService;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Exception;

class BreedService implements ServiceInterface
{
    protected ImageService $imageService;

    public function __construct(ImageService $imageService)
    {
        $this->imageService = $imageService;
    }
    /**
     * Get all breeds with optional pagination
     */
    public function getAll(int $perPage = 15): LengthAwarePaginator
    {
        return Breed::with(['species', 'image'])->paginate($perPage);
    }

    /**
     * Get breed by ID
     */
    public function getById(int $id): ?Breed
    {
        return Breed::with(['species', 'image'])->find($id);
    }

    /**
     * Get breed by UUID
     */
    public function getByUuid(string $uuid): ?Breed
    {
        return Breed::with(['species', 'image'])->where('uuid', $uuid)->first();
    }

    /**
     * Create new breed from DTO
     */
    public function create(BreedDTO $dto, ?UploadedFile $imageFile = null): Breed
    {
        try {
            $breed = Breed::create($dto->toCreateArray());

            // Handle image upload if provided
            if ($imageFile) {
                $this->imageService->save($breed, $imageFile, 'image_id');
                $breed->load('image'); // Reload with image relationship
            }

            return $breed->load('species');
        } catch (Exception $e) {
            throw new Exception("Failed to create breed: " . $e->getMessage());
        }
    }

    /**
     * Update breed by UUID from DTO
     */
    public function update(string $uuid, BreedDTO $dto, ?UploadedFile $imageFile = null): ?Breed
    {
        try {
            $breed = $this->getByUuid($uuid);

            if (!$breed) {
                return null;
            }

            $updateData = $dto->toUpdateArray();

            // Handle image upload if provided
            if ($imageFile) {
                $this->imageService->update($breed, $imageFile);
                // Reload with image relationship
                $breed->load('image');
            }

            if (empty($updateData)) {
                return $breed;
            }

            $breed->update($updateData);
            return $breed->fresh(['species', 'image']);
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
        return Breed::with(['species', 'image'])
            ->where('breed_name', 'LIKE', "%{$name}%")
            ->paginate($perPage);
    }

    /**
     * Get breeds by species ID
     */
    public function getBySpeciesId(int $speciesId, int $perPage = 15): LengthAwarePaginator
    {
        return Breed::with(['species', 'image'])
            ->where('species_id', $speciesId)
            ->paginate($perPage);
    }
}
