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
            'roles' => $this->whenLoaded('roles', function () {
                return $this->roles->map(function ($role) {
                    return [
                        'uuid' => $role->uuid,
                        'name' => $role->name,
                        'display_name' => $role->localized_name,
                        'guard_name' => $role->guard_name,
                        'created_at' => $role->created_at,
                    ];
                });
            }),
            'created_at' => $this->created_at,
        ];
    }
}