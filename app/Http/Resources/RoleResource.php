<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RoleResource extends JsonResource
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
            'guard_name' => $this->guard_name,
            'description' => $this->description,
            'permissions' => $this->whenLoaded('permissions', function () {
                return $this->permissions->map(function ($permission) {
                    return [
                        'uuid' => $permission->uuid,
                        'name' => $permission->name,
                        'group' => $permission->group ? $permission->group->name : null,
                        'group_name' => $permission->group ? $permission->group->name : 'Other',
                    ];
                });
            }),
            'permissions_count' => $this->whenLoaded('permissions', $this->permissions->count(), $this->permissions_count),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
