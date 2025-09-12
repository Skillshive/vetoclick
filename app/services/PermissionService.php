<?php

namespace App\Services;

use App\DTOs\PermissionDto;
use App\Interfaces\ServiceInterface;
use App\Models\Permission;
use App\Models\PermissionGroup;
use Illuminate\Pagination\LengthAwarePaginator;
use Exception;

class PermissionService implements ServiceInterface
{
    public function query()
    {
        return Permission::with(['group']);
    }

    /**
     * Add search functionality to query builder
     */
    public function search($query, string $search)
    {
        return $query->where('name', 'LIKE', "%{$search}%")
                    ->orWhere('guard_name', 'LIKE', "%{$search}%")
                    ->orWhereHas('group', function ($query) use ($search) {
                        $query->where('name', 'LIKE', "%{$search}%");
                    });
    }

    /**
     * Get all permissions with optional pagination
     */
    public function getAll(int $perPage = 15): LengthAwarePaginator
    {
        return Permission::with(['group'])
            ->paginate($perPage);
    }

    /**
     * Get permission by ID
     */
    public function getById(int $id): ?Permission
    {
        return Permission::with(['group'])->find($id);
    }

    /**
     * Get permission by UUID
     */
    public function getByUuid(string $uuid): ?Permission
    {
        return Permission::with(['group'])
            ->where('uuid', $uuid)
            ->first();
    }

    /**
     * Create new permission from DTO
     */
    public function create(PermissionDto $dto): Permission
    {
        try {
            $permission = Permission::create([
                'name' => $dto->name,
                'guard_name' => $dto->guard_name,
                'grp_id' => $dto->grp_id,
            ]);

            return $permission->load(['group']);
        } catch (Exception $e) {
            throw new Exception("Failed to create permission");
        }
    }

    /**
     * Update permission by UUID from DTO
     */
    public function update(string $uuid, PermissionDto $dto): ?Permission
    {
        try {
            $permission = $this->getByUuid($uuid);

            if (!$permission) {
                return null;
            }

            $permission->update([
                'name' => $dto->name,
                'guard_name' => $dto->guard_name,
                'grp_id' => $dto->grp_id,
            ]);

            return $permission->refresh();
        } catch (Exception $e) {
            throw new Exception("Failed to update permission");
        }
    }

    /**
     * Delete permission by UUID
     */
    public function delete(string $uuid): bool
    {
        try {
            $permission = $this->getByUuid($uuid);

            if (!$permission) {
                return false;
            }

            return $permission->delete();
        } catch (Exception $e) {
            throw new Exception("Failed to delete permission");
        }
    }

    /**
     * Search permissions with pagination
     */
    public function searchPermissions(string $search, int $perPage = 15): LengthAwarePaginator
    {
        return Permission::with(['group'])
            ->where('name', 'LIKE', "%{$search}%")
            ->orWhere('guard_name', 'LIKE', "%{$search}%")
            ->orWhereHas('group', function ($query) use ($search) {
                $query->where('name', 'LIKE', "%{$search}%");
            })
            ->paginate($perPage);
    }

    /**
     * Get all permissions grouped by permission groups
     */
    public function getGroupedPermissions(): array
    {
        try {
            $permissions = Permission::with('group')->get();
            
            return $permissions->groupBy('group.name')->map(function ($groupPermissions, $groupName) {
                return [
                    'group_name' => $groupName,
                    'permissions' => $groupPermissions->map(function ($permission) {
                        return [
                            'id' => $permission->id,
                            'uuid' => $permission->uuid,
                            'name' => $permission->name,
                        ];
                    })->toArray()
                ];
            })->values()->toArray();
        } catch (Exception $e) {
            throw new Exception("Failed to get grouped permissions");
        }
    }

    /**
     * Get all permission groups
     */
    public function getPermissionGroups(): array
    {
        try {
            return PermissionGroup::all()->map(function ($group) {
                return [
                    'id' => $group->id,
                    'uuid' => $group->uuid,
                    'name' => $group->name,
                ];
            })->toArray();
        } catch (Exception $e) {
            throw new Exception("Failed to get permission groups");
        }
    }
}
