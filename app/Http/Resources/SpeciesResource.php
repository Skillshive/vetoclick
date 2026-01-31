<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SpeciesResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $perPage = $request->get('breeds_per_page', 8);
        $currentPage = $request->get('breeds_page', 1);

        return [
            'uuid' => $this->uuid,
            'name' => $this->name,
            'description' => $this->description,
            'image' => $this->getImagePath(),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'breeds' => $this->when($this->relationLoaded('breeds'), function () use ($perPage, $currentPage) {
                $breeds = $this->breeds()->orderBy('created_at', 'desc')->paginate($perPage, ['*'], 'page', $currentPage);
                return [
                    'data' => BreedResource::collection($breeds->items()),
                    'meta' => [
                        'current_page' => $breeds->currentPage(),
                        'from' => $breeds->firstItem(),
                        'last_page' => $breeds->lastPage(),
                        'per_page' => $breeds->perPage(),
                        'to' => $breeds->lastItem(),
                        'total' => $breeds->total(),
                    ],
                    'links' => [
                        'first' => $breeds->url(1),
                        'last' => $breeds->url($breeds->lastPage()),
                        'prev' => $breeds->previousPageUrl(),
                        'next' => $breeds->nextPageUrl(),
                    ]
                ];
            }),
        ];
    }
}
