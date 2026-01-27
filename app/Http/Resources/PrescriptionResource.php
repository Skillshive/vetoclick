<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PrescriptionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        return [
            'uuid' => $this->uuid,
            'medication' => $this->product_id ? $this->product->name : $this->medication,
            'dosage' => $this->dosage,
            'frequency' => $this->frequency,
        ];
    }
}
