<?php

namespace App\Http\Resources\Product;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
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
            'name' => $this->name,
            'sku' => $this->sku,
            'brand' => $this->brand,
            'description' => $this->description,
            'barcode' => $this->barcode,
            'type' => $this->type,
            'dosage_form' => $this->dosage_form,
            'target_species' => $this->target_species ? json_decode($this->target_species, true) : null,
            'administration_route' => $this->administration_route,
            'prescription_required' => $this->prescription_required,
            'minimum_stock_level' => $this->minimum_stock_level,
            'maximum_stock_level' => $this->maximum_stock_level,
            'is_active' => $this->is_active,
            'availability_status' => $this->availability_status,
            'notes' => $this->notes,
            'image' => $this->getImagePath(),
            // Vaccine-specific fields
            'manufacturer' => $this->manufacturer,
            'batch_number' => $this->batch_number,
            'expiry_date' => $this->expiry_date,
            'dosage_ml' => $this->dosage_ml,
            'vaccine_instructions' => $this->vaccine_instructions,
            'category' => $this->whenLoaded('category', function () {
                return [
                    'id' => $this->category->id,
                    'name' => $this->category->name,
                ];
            }),
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
