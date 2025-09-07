<?php

namespace App\services;

use App\DTOs\SpeciesDto;
use App\Models\Species;
use App\Interfaces\ServiceInterface;
use App\Services\ImageService;
use Exception;

class SpeciesService implements ServiceInterface
{
    protected ImageService $imageService;

    public function __construct(ImageService $imageService)
    {
        $this->imageService = $imageService;
    }
    
    /**
     * Get all species with optional pagination
     */
    public function getAll(?int $perPage = 15)
    {
        if ($perPage === null || $perPage === 0) {
            return Species::with('image')->get();
        }
        return Species::with('image')->paginate($perPage);
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
    public function create(SpeciesDto $dto): Species
    {
        try {
            if($dto->image) {
                $image = $this->imageService->saveImage($dto->image, 'species/');
                $image_id = $image->id;
            } else {
                $image_id = null;
            }

            $createData = Species::create([
                'name' => $dto->name,
                'description' => $dto->description,
                'image_id' =>  $image_id,
            ]);
            
            return $createData;
        } catch (Exception $e) {
            throw new Exception("Failed to create species");
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

            if($dto->image) {
                $image = $this->imageService->saveImage($dto->image, 'species/');
                $image_id = $image->id;
            } else {
                $image_id = null;
            }

            $species->update([
                'name' => $dto->name,
                'description' => $dto->description,
                'image_id' =>  $image_id,
            ]);

            return $species->refresh();
        } catch (Exception $e) {
            throw new Exception("Failed to update species");
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
            throw new Exception("Failed to delete species");
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
