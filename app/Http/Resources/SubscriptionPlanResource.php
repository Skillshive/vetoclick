<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SubscriptionPlanResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'name' => $this->name,
            'description' => $this->description,
            'features' => $this->whenLoaded('planFeatures', function () {
                return $this->planFeatures->map(function ($feature) {
                    return [
                        'id' => $feature->id,
                        'uuid' => $feature->uuid,
                        'slug' => $feature->slug,
                        'name' => $feature->name,
                        'description' => $feature->description,
                        'icon' => $feature->icon,
                        'color' => $feature->color,
                        'group' => $feature->relationLoaded('group') ? [
                            'id' => $feature->group->id,
                            'uuid' => $feature->group->uuid,
                            'slug' => $feature->group->slug,
                            'name' => $feature->group->name,
                            'description' => $feature->group->description,
                            'icon' => $feature->group->icon,
                            'color' => $feature->group->color,
                        ] : null
                    ];
                });
            }),
            'price' => $this->price,
            'yearly_price' => $this->yearly_price,
            'max_clients' => $this->max_clients,
            'max_pets' => $this->max_pets,
            'max_appointments' => $this->max_appointments,
            'is_active' => $this->is_active,
            'is_popular' => $this->is_popular,
            'sort_order' => $this->sort_order,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}