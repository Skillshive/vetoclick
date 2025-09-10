<?php

namespace App\Http\Resources\UserManagment;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
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
            'name' => $this->firstname . ' ' . $this->lastname,
            "firstname" => $this->firstname,
            "lastname" => $this->lastname,
            'phone' => $this->phone,
            'email' => $this->email,
            'image' => $this->getImagePath(),
            'created_at' => $this->created_at,
        ];
    }
}