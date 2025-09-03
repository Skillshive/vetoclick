<?php

namespace App\common;

use App\common\DTO;

class BreedDTO extends DTO
{
    public ?int $id;
    public ?string $uuid;
    public string $breed_name;
    public ?float $avg_weight_kg;
    public ?int $life_span_years;
    public ?string $common_health_issues;
    public int $species_id;
    public ?int $image_id;
    public ?string $created_at;
    public ?string $updated_at;
    public ?string $deleted_at;

    public function __construct(
        ?int $id = null,
        ?string $uuid = null,
        string $breed_name = '',
        ?float $avg_weight_kg = null,
        ?int $life_span_years = null,
        ?string $common_health_issues = null,
        int $species_id = 0,
        ?int $image_id = null,
        ?string $created_at = null,
        ?string $updated_at = null,
        ?string $deleted_at = null
    ) {
        $this->id = $id;
        $this->uuid = $uuid;
        $this->breed_name = $breed_name;
        $this->avg_weight_kg = $avg_weight_kg;
        $this->life_span_years = $life_span_years;
        $this->common_health_issues = $common_health_issues;
        $this->species_id = $species_id;
        $this->image_id = $image_id;
        $this->created_at = $created_at;
        $this->updated_at = $updated_at;
        $this->deleted_at = $deleted_at;
    }

    protected static function fromArray(array $data): self
    {
        return new self(
            id: $data['id'] ?? null,
            uuid: $data['uuid'] ?? null,
            breed_name: $data['breed_name'] ?? '',
            avg_weight_kg: isset($data['avg_weight_kg']) ? (float) $data['avg_weight_kg'] : null,
            life_span_years: isset($data['life_span_years']) ? (int) $data['life_span_years'] : null,
            common_health_issues: $data['common_health_issues'] ?? null,
            species_id: $data['species_id'] ?? 0,
            image_id: $data['image_id'] ?? null,
            created_at: $data['created_at'] ?? null,
            updated_at: $data['updated_at'] ?? null,
            deleted_at: $data['deleted_at'] ?? null
        );
    }

    public function toArray(): array
    {
        return [
            'uuid' => $this->uuid,
            'breed_name' => $this->breed_name,
            'avg_weight_kg' => $this->avg_weight_kg,
            'life_span_years' => $this->life_span_years,
            'common_health_issues' => $this->common_health_issues,
            'species_id' => $this->species_id,
            'image_id' => $this->image_id,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'deleted_at' => $this->deleted_at,
        ];
    }

    public function toFrontendArray(): array
    {
        return [
            'uuid' => $this->uuid,
            'breed_name' => $this->breed_name,
            'avg_weight_kg' => $this->avg_weight_kg,
            'life_span_years' => $this->life_span_years,
            'common_health_issues' => $this->common_health_issues,
            'species_id' => $this->species_id,
            'image_id' => $this->image_id,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

    public function toCreateArray(): array
    {
        return [
            'breed_name' => $this->breed_name,
            'avg_weight_kg' => $this->avg_weight_kg,
            'life_span_years' => $this->life_span_years,
            'common_health_issues' => $this->common_health_issues,
            'species_id' => $this->species_id,
            'image_id' => $this->image_id,
        ];
    }

    public function toUpdateArray(): array
    {
        $data = [];

        if (!empty($this->breed_name)) {
            $data['breed_name'] = $this->breed_name;
        }

        if ($this->avg_weight_kg !== null) {
            $data['avg_weight_kg'] = $this->avg_weight_kg;
        }

        if ($this->life_span_years !== null) {
            $data['life_span_years'] = $this->life_span_years;
        }

        if ($this->common_health_issues !== null) {
            $data['common_health_issues'] = $this->common_health_issues;
        }

        if ($this->species_id > 0) {
            $data['species_id'] = $this->species_id;
        }

        if ($this->image_id !== null) {
            $data['image_id'] = $this->image_id;
        }

        return $data;
    }
}
