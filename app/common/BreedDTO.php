<?php

namespace App\common;

use App\common\DTO;

class BreedDTO extends DTO
{
    public ?int $id;
    public ?string $uuid;
    public string $name;
    public ?string $description;
    public int $species_id;
    public ?string $size;
    public ?string $average_lifespan;
    public ?string $temperament;
    public ?string $exercise_needs;
    public ?string $grooming_needs;
    public ?string $origin;
    public ?string $image_url;
    public ?string $created_at;
    public ?string $updated_at;
    public ?string $deleted_at;

    public function __construct(
        ?int $id = null,
        ?string $uuid = null,
        string $name = '',
        ?string $description = null,
        int $species_id = 0,
        ?string $size = null,
        ?string $average_lifespan = null,
        ?string $temperament = null,
        ?string $exercise_needs = null,
        ?string $grooming_needs = null,
        ?string $origin = null,
        ?string $image_url = null,
        ?string $created_at = null,
        ?string $updated_at = null,
        ?string $deleted_at = null
    ) {
        $this->id = $id;
        $this->uuid = $uuid;
        $this->name = $name;
        $this->description = $description;
        $this->species_id = $species_id;
        $this->size = $size;
        $this->average_lifespan = $average_lifespan;
        $this->temperament = $temperament;
        $this->exercise_needs = $exercise_needs;
        $this->grooming_needs = $grooming_needs;
        $this->origin = $origin;
        $this->image_url = $image_url;
        $this->created_at = $created_at;
        $this->updated_at = $updated_at;
        $this->deleted_at = $deleted_at;
    }

    protected static function fromArray(array $data): self
    {
        return new self(
            id: $data['id'] ?? null,
            uuid: $data['uuid'] ?? null,
            name: $data['name'] ?? '',
            description: $data['description'] ?? null,
            species_id: $data['species_id'] ?? 0,
            size: $data['size'] ?? null,
            average_lifespan: $data['average_lifespan'] ?? null,
            temperament: $data['temperament'] ?? null,
            exercise_needs: $data['exercise_needs'] ?? null,
            grooming_needs: $data['grooming_needs'] ?? null,
            origin: $data['origin'] ?? null,
            image_url: $data['image_url'] ?? null,
            created_at: $data['created_at'] ?? null,
            updated_at: $data['updated_at'] ?? null,
            deleted_at: $data['deleted_at'] ?? null
        );
    }

    public function toArray(): array
    {
        return [
            'uuid' => $this->uuid,
            'name' => $this->name,
            'description' => $this->description,
            'species_id' => $this->species_id,
            'size' => $this->size,
            'average_lifespan' => $this->average_lifespan,
            'temperament' => $this->temperament,
            'exercise_needs' => $this->exercise_needs,
            'grooming_needs' => $this->grooming_needs,
            'origin' => $this->origin,
            'image_url' => $this->image_url,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'deleted_at' => $this->deleted_at,
        ];
    }

    public function toFrontendArray(): array
    {
        return [
            'uuid' => $this->uuid,
            'name' => $this->name,
            'description' => $this->description,
            'species_id' => $this->species_id,
            'size' => $this->size,
            'average_lifespan' => $this->average_lifespan,
            'temperament' => $this->temperament,
            'exercise_needs' => $this->exercise_needs,
            'grooming_needs' => $this->grooming_needs,
            'origin' => $this->origin,
            'image_url' => $this->image_url,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

    public function toCreateArray(): array
    {
        return [
            'name' => $this->name,
            'description' => $this->description,
            'species_id' => $this->species_id,
            'size' => $this->size,
            'average_lifespan' => $this->average_lifespan,
            'temperament' => $this->temperament,
            'exercise_needs' => $this->exercise_needs,
            'grooming_needs' => $this->grooming_needs,
            'origin' => $this->origin,
            'image_url' => $this->image_url,
        ];
    }

    public function toUpdateArray(): array
    {
        $data = [];
        
        if (!empty($this->name)) {
            $data['name'] = $this->name;
        }
        
        if ($this->description !== null) {
            $data['description'] = $this->description;
        }
        
        if ($this->species_id > 0) {
            $data['species_id'] = $this->species_id;
        }
        
        if ($this->size !== null) {
            $data['size'] = $this->size;
        }
        
        if ($this->average_lifespan !== null) {
            $data['average_lifespan'] = $this->average_lifespan;
        }
        
        if ($this->temperament !== null) {
            $data['temperament'] = $this->temperament;
        }
        
        if ($this->exercise_needs !== null) {
            $data['exercise_needs'] = $this->exercise_needs;
        }
        
        if ($this->grooming_needs !== null) {
            $data['grooming_needs'] = $this->grooming_needs;
        }
        
        if ($this->origin !== null) {
            $data['origin'] = $this->origin;
        }
        
        if ($this->image_url !== null) {
            $data['image_url'] = $this->image_url;
        }
        
        return $data;
    }
}
