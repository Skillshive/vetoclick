<?php

namespace App\Services;

use App\DTOs\BreedDTO;
use App\Models\Breed;
use App\Interfaces\ServiceInterface;
use App\Models\Species;
use App\Services\ImageService;
use Illuminate\Pagination\LengthAwarePaginator;
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
     * Get breed by UUID
     */
    public function getByUuid(string $uuid): ?Breed
    {
        return Breed::with(['species', 'image'])->where('uuid', $uuid)->first();
    }

    /**
     * Create new breed from DTO
     */
    public function create(BreedDTO $dto): Breed
    {
         try {
            if($dto->image) {
                $image = $this->imageService->saveImage($dto->image, 'breeds/');
                $image_id = $image->id;
            } else {
                $image_id = null;
            }

            $createData = Breed::create([
                'breed_name' => $dto->breed_name,
                'avg_weight_kg' => $dto->avg_weight_kg,
                'life_span_years' => $dto->life_span_years,
                'species_id' => $dto->species_id?$this->getSpeciesByUuid($dto->species_id)->id:null,
                'image_id' =>  $image_id,
            ]);
            
            return $createData;
        } 
        catch (Exception $e) {
            throw new Exception("Failed to create breed");
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

            if($dto->image) {
                $image = $this->imageService->saveImage($dto->image, 'breeds/');
                $image_id = $image->id;
            } else {
                $image_id = null;
            }

            $breed->update([
                'breed_name' => $dto->breed_name,
                'avg_weight_kg' => $dto->avg_weight_kg,
                'life_span_years' => $dto->life_span_years,
                'species_id' => $dto->species_id?$this->getSpeciesByUuid($dto->species_id)->id:null,
                'image_id' =>  $image_id,
            ]);

            return $breed->refresh();
        } catch (Exception $e) {
            throw new Exception("Failed to update breed");
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
            throw new Exception("Failed to delete breed");
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

    /**
     * Get Species by UUID
     */
    private function getSpeciesByUuid(string $uuid): ?Species
    {
        return Species::where('uuid', $uuid)->first();
    }
}
