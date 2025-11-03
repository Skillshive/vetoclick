<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PetResource extends JsonResource
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
            'name' => $this->name,
            'species' => $this->species->name,
            'breed' => $this->breed->name,
            'gender' => $this->gender,
            'date_of_birth' => $this->date_of_birth,
            'avatar' => $this->getFirstMediaUrl('avatar'),
        ];
    }
}
