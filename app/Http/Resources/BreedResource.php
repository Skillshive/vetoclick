<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BreedResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'uuid' => $this->uuid,
            'breed_name' => $this->breed_name,
            'avg_weight_kg' => $this->avg_weight_kg,
            'life_span_years' => $this->life_span_years,
            'image' => $this->getImagePath(),
            'species' => $this->whenLoaded('species'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}