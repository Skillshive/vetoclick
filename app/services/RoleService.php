<?php

namespace App\Services;

use App\DTOs\RoleDto;
use App\Interfaces\ServiceInterface;
use App\Models\Role;
use App\Models\Permission;
use Illuminate\Pagination\LengthAwarePaginator;
use Exception;

class RoleService implements ServiceInterface
{
    public function query()
    {
        return Role::with(['permissions.group']);
    }

    /**
     * Add search functionality to query builder
     */
    public function search($query, string $search)
    {
        return $query->where('name', 'LIKE', "%{$search}%")
                    ->orWhere('guard_name', 'LIKE', "%{$search}%");
    }

    /**
     * Get all roles with optional pagination
     */
    public function getAll(int $perPage = 15): LengthAwarePaginator
    {
        return Role::with(['permissions.group'])
            ->withCount('permissions')
            ->paginate($perPage);
    }

    /**
     * Get role by ID
     */
    public function getById(int $id): ?Role
    {
        return Role::with(['permissions.group'])->find($id);
    }

    /**
     * Get role by UUID
     */
    public function getByUuid(string $uuid): ?Role
    {
        return Role::with(['permissions.group'])
            ->where('uuid', $uuid)
            ->first();
    }

    /**
     * Create new role from DTO
     */
    public function create(RoleDto $dto): Role
    {
        try {
            $role = Role::create([
                'name' => $dto->name,
                'guard_name' => "web",
            ]);

            // Assign permissions if provided
            if (!empty($dto->permissions)) {
                $permissions = Permission::whereIn('uuid', $dto->permissions)->get();
                $role->syncPermissions($permissions);
            } else {
                // Remove all permissions if empty array is provided
                $role->syncPermissions([]);
            }

            return $role->load(['permissions.group']);
        } catch (Exception $e) {
            throw new Exception("Failed to create role");
        }
    }

    /**
     * Update role by UUID from DTO
     */
    public function update(string $uuid, RoleDto $dto): ?Role
    {
        try {
            $role = $this->getByUuid($uuid);

            if (!$role) {
                return null;
            }

            $role->update([
                'name' => $dto->name,
                'guard_name' => "web",
            ]);

            // Sync permissions if provided
            if (!empty($dto->permissions)) {
                $permissions = Permission::whereIn('uuid', $dto->permissions)->get();
                $role->syncPermissions($permissions);
            } else {
                // Remove all permissions if empty array is provided
                $role->syncPermissions([]);
            }

            return $role->refresh();
        } catch (Exception $e) {
            throw new Exception("Failed to update role");
        }
    }

    /**
     * Delete role by UUID
     */
    public function delete(string $uuid): bool
    {
        try {
            $role = $this->getByUuid($uuid);

            if (!$role) {
                return false;
            }

            return $role->delete();
        } catch (Exception $e) {
            throw new Exception("Failed to delete role");
        }
    }

    /**
     * Search roles with pagination
     */
    public function searchRoles(string $search, int $perPage = 15): LengthAwarePaginator
    {
        return Role::with(['permissions.group'])
            ->withCount('permissions')
            ->where('name', 'LIKE', "%{$search}%")
            ->paginate($perPage);
    }

    /**
     * Assign permissions to role
     */
    public function assignPermissions(string $uuid, array $permissionIds): bool
    {
        try {
            $role = $this->getByUuid($uuid);

            if (!$role) {
                return false;
            }

            $permissions = Permission::whereIn('id', $permissionIds)->get();
            $role->syncPermissions($permissions);

            return true;
        } catch (Exception $e) {
            throw new Exception("Failed to assign permissions to role");
        }
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
}
