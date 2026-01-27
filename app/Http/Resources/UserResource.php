<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
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
            'first_name' => $this->firstname ?? $this->first_name,
            'last_name' => $this->lastname ?? $this->last_name,
            'email' => $this->email,
            // Use 'image_url' accessor or similar if defined on User model, else fallback to image data or null
            'avatar' => isset($this->image_url)
                ? $this->image_url
                : (isset($this->profile_img) ? $this->profile_img : null),
        ];
    }
}
