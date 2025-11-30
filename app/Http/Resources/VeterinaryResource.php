<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class VeterinaryResource extends JsonResource
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
            'license_number' => $this->license_number,
            'specialization' => $this->specialization,
            'years_experience' => $this->years_experience,
            'clinic_name' => $this->clinic_name,
            'profile_img' => $this->profile_img,
            'address' => $this->address,
            'subscription_status' => $this->subscription_status,
            'subscription_start_date' => $this->subscription_start_date,
            'subscription_end_date' => $this->subscription_end_date,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'user' => new UserResource($this->whenLoaded('user')),
        ];
    }
}
