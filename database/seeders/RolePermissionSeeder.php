<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\PermissionGroup;
use Illuminate\Support\Str;
class RolePermissionSeeder extends Seeder
{
    /** 
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Permission Groups
        $userManagementGroup = PermissionGroup::create([
            'uuid' => Str::uuid(),
            'name' => 'User Management',
        ]);

        $roleManagementGroup = PermissionGroup::create([
            'uuid' => Str::uuid(),
            'name' => 'Role Management',
        ]);

        $contentManagementGroup = PermissionGroup::create([
            'uuid' => Str::uuid(),
            'name' => 'Content Management',
        ]);

        $systemManagementGroup = PermissionGroup::create([
            'uuid' => Str::uuid(),
            'name' => 'System Management',
        ]);

        // Create Permissions
        $permissions = [
            // User Management
            ['name' => 'users.view', 'group' => $userManagementGroup],
            ['name' => 'users.create', 'group' => $userManagementGroup],
            ['name' => 'users.edit', 'group' => $userManagementGroup],
            ['name' => 'users.delete', 'group' => $userManagementGroup],

            // Role Management
            ['name' => 'roles.view', 'group' => $roleManagementGroup],
            ['name' => 'roles.create', 'group' => $roleManagementGroup],
            ['name' => 'roles.edit', 'group' => $roleManagementGroup],
            ['name' => 'roles.delete', 'group' => $roleManagementGroup],
            ['name' => 'permissions.view', 'group' => $roleManagementGroup],
            ['name' => 'permissions.create', 'group' => $roleManagementGroup],
            ['name' => 'permissions.edit', 'group' => $roleManagementGroup],
            ['name' => 'permissions.delete', 'group' => $roleManagementGroup],

            // Content Management
            ['name' => 'blogs.view', 'group' => $contentManagementGroup],
            ['name' => 'blogs.create', 'group' => $contentManagementGroup],
            ['name' => 'blogs.edit', 'group' => $contentManagementGroup],
            ['name' => 'blogs.delete', 'group' => $contentManagementGroup],
            ['name' => 'products.view', 'group' => $contentManagementGroup],
            ['name' => 'products.create', 'group' => $contentManagementGroup],
            ['name' => 'products.edit', 'group' => $contentManagementGroup],
            ['name' => 'products.delete', 'group' => $contentManagementGroup],

            // System Management
            ['name' => 'settings.view', 'group' => $systemManagementGroup],
            ['name' => 'settings.edit', 'group' => $systemManagementGroup],
            ['name' => 'logs.view', 'group' => $systemManagementGroup],
            ['name' => 'backups.create', 'group' => $systemManagementGroup],
        ];

        foreach ($permissions as $permission) {
            Permission::create([
                'uuid' => Str::uuid(),
                'name' => $permission['name'],
                'guard_name' => 'web',
                'grp_id' => $permission['group']->id,
            ]);
        }

        // Create Roles
        $adminRole = Role::create([
            'uuid' => Str::uuid(),
            'name' => 'admin',
            'guard_name' => 'web',
        ]);


        $veterinarianRole = Role::create([
            'uuid' => Str::uuid(),
            'name' => 'veterinarian',
            'guard_name' => 'web',
        ]);

        $receptionistRole = Role::create([
            'uuid' => Str::uuid(),
            'name' => 'receptionist',
            'guard_name' => 'web',
        ]);

        $clientRole = Role::create([
            'uuid' => Str::uuid(),
            'name' => 'client',
            'guard_name' => 'web',
        ]);

        // Assign permissions to roles
        $adminRole->givePermissionTo(Permission::all());

        $veterinarianRole->givePermissionTo([
            'users.view',
            'blogs.view',
            'blogs.create',
            'blogs.edit',
            'products.view',
            'products.create',
            'products.edit',
            'settings.view',
        ]);

        $receptionistRole->givePermissionTo([
            'users.view',
            'users.create',
            'users.edit',
            'blogs.view',
            'products.view',
            'products.create',
            'products.edit',
        ]);
    }
}
