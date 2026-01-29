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
                if (!$this->roles) {
                    return [];
                }
                return $this->roles->map(function ($role) {
                    return [
                        'uuid' => $role->uuid ?? '',
                        'name' => $role->name ?? '',
                        'display_name' => $role->localized_name ?? $role->name ?? '',
                        'guard_name' => $role->guard_name ?? '',
                        'created_at' => $role->created_at ?? null,
                    ];
                })->toArray();
            }, []),
            'receptionist' => $this->whenLoaded('receptionist', function () {
                if ($this->receptionist && $this->receptionist->relationLoaded('veterinary')) {
                    $vet = $this->receptionist->veterinary;
                    if ($vet) {
                        $vetName = '';
                        if ($vet->relationLoaded('user') && $vet->user) {
                            $vetName = ($vet->user->firstname ?? '') . ' ' . ($vet->user->lastname ?? '');
                        }
                        return [
                            'veterinary' => [
                                'uuid' => $vet->uuid,
                                'name' => trim($vetName) ?: '',
                            ],
                        ];
                    }
                }
                return null;
            }),
            'created_at' => $this->created_at,
        ];
    }
}