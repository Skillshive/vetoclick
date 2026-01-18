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

        $clientManagementGroup = PermissionGroup::create([
            'uuid' => Str::uuid(),
            'name' => 'Client Management',
        ]);

        $appointmentManagementGroup = PermissionGroup::create([
            'uuid' => Str::uuid(),
            'name' => 'Appointment Management',
        ]);

        $inventoryManagementGroup = PermissionGroup::create([
            'uuid' => Str::uuid(),
            'name' => 'Inventory Management',
        ]);

        $medicalManagementGroup = PermissionGroup::create([
            'uuid' => Str::uuid(),
            'name' => 'Medical Management',
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
            ['name' => 'roles.assign-permissions', 'group' => $roleManagementGroup],
            ['name' => 'permissions.view', 'group' => $roleManagementGroup],
            ['name' => 'permissions.create', 'group' => $roleManagementGroup],
            ['name' => 'permissions.edit', 'group' => $roleManagementGroup],
            ['name' => 'permissions.delete', 'group' => $roleManagementGroup],

            // Content Management
            ['name' => 'blogs.view', 'group' => $contentManagementGroup],
            ['name' => 'blogs.create', 'group' => $contentManagementGroup],
            ['name' => 'blogs.edit', 'group' => $contentManagementGroup],
            ['name' => 'blogs.delete', 'group' => $contentManagementGroup],
            ['name' => 'blogs.search', 'group' => $contentManagementGroup],
            ['name' => 'products.view', 'group' => $contentManagementGroup],
            ['name' => 'products.create', 'group' => $contentManagementGroup],
            ['name' => 'products.edit', 'group' => $contentManagementGroup],
            ['name' => 'products.delete', 'group' => $contentManagementGroup],
            ['name' => 'products.export', 'group' => $contentManagementGroup],
            ['name' => 'category-products.view', 'group' => $contentManagementGroup],
            ['name' => 'category-products.create', 'group' => $contentManagementGroup],
            ['name' => 'category-products.edit', 'group' => $contentManagementGroup],
            ['name' => 'category-products.delete', 'group' => $contentManagementGroup],
            ['name' => 'category-products.export', 'group' => $contentManagementGroup],
            ['name' => 'category-products.import', 'group' => $contentManagementGroup],
            ['name' => 'category-blogs.view', 'group' => $contentManagementGroup],
            ['name' => 'category-blogs.create', 'group' => $contentManagementGroup],
            ['name' => 'category-blogs.edit', 'group' => $contentManagementGroup],
            ['name' => 'category-blogs.delete', 'group' => $contentManagementGroup],
            ['name' => 'category-blogs.export', 'group' => $contentManagementGroup],
            ['name' => 'category-blogs.import', 'group' => $contentManagementGroup],

            // Client Management
            ['name' => 'clients.view', 'group' => $clientManagementGroup],
            ['name' => 'clients.create', 'group' => $clientManagementGroup],
            ['name' => 'clients.edit', 'group' => $clientManagementGroup],
            ['name' => 'clients.delete', 'group' => $clientManagementGroup],
            ['name' => 'pets.view', 'group' => $clientManagementGroup],
            ['name' => 'pets.create', 'group' => $clientManagementGroup],
            ['name' => 'pets.edit', 'group' => $clientManagementGroup],
            ['name' => 'pets.delete', 'group' => $clientManagementGroup],
            ['name' => 'species.view', 'group' => $clientManagementGroup],
            ['name' => 'species.create', 'group' => $clientManagementGroup],
            ['name' => 'species.edit', 'group' => $clientManagementGroup],
            ['name' => 'species.delete', 'group' => $clientManagementGroup],
            ['name' => 'breeds.view', 'group' => $clientManagementGroup],
            ['name' => 'breeds.create', 'group' => $clientManagementGroup],
            ['name' => 'breeds.edit', 'group' => $clientManagementGroup],
            ['name' => 'breeds.delete', 'group' => $clientManagementGroup],

            // Appointment Management
            ['name' => 'appointments.view', 'group' => $appointmentManagementGroup],
            ['name' => 'appointments.create', 'group' => $appointmentManagementGroup],
            ['name' => 'appointments.edit', 'group' => $appointmentManagementGroup],
            ['name' => 'appointments.delete', 'group' => $appointmentManagementGroup],
            ['name' => 'appointments.cancel', 'group' => $appointmentManagementGroup],
            ['name' => 'appointments.accept', 'group' => $appointmentManagementGroup],
            ['name' => 'appointments.report', 'group' => $appointmentManagementGroup],
            ['name' => 'appointments.request', 'group' => $appointmentManagementGroup],
            ['name' => 'appointments.calendar', 'group' => $appointmentManagementGroup],
            ['name' => 'availability.view', 'group' => $appointmentManagementGroup],
            ['name' => 'availability.create', 'group' => $appointmentManagementGroup],
            ['name' => 'availability.edit', 'group' => $appointmentManagementGroup],
            ['name' => 'availability.delete', 'group' => $appointmentManagementGroup],

            // Inventory Management
            ['name' => 'suppliers.view', 'group' => $inventoryManagementGroup],
            ['name' => 'suppliers.create', 'group' => $inventoryManagementGroup],
            ['name' => 'suppliers.edit', 'group' => $inventoryManagementGroup],
            ['name' => 'suppliers.delete', 'group' => $inventoryManagementGroup],
            ['name' => 'suppliers.export', 'group' => $inventoryManagementGroup],
            ['name' => 'suppliers.import', 'group' => $inventoryManagementGroup],
            ['name' => 'orders.view', 'group' => $inventoryManagementGroup],
            ['name' => 'orders.create', 'group' => $inventoryManagementGroup],
            ['name' => 'orders.edit', 'group' => $inventoryManagementGroup],
            ['name' => 'orders.delete', 'group' => $inventoryManagementGroup],
            ['name' => 'orders.confirm', 'group' => $inventoryManagementGroup],
            ['name' => 'orders.receive', 'group' => $inventoryManagementGroup],
            ['name' => 'orders.cancel', 'group' => $inventoryManagementGroup],
            ['name' => 'lots.view', 'group' => $inventoryManagementGroup],
            ['name' => 'lots.create', 'group' => $inventoryManagementGroup],
            ['name' => 'lots.edit', 'group' => $inventoryManagementGroup],
            ['name' => 'lots.delete', 'group' => $inventoryManagementGroup],

            // Medical Management
            ['name' => 'consultations.view', 'group' => $medicalManagementGroup],
            ['name' => 'consultations.create', 'group' => $medicalManagementGroup],
            ['name' => 'consultations.edit', 'group' => $medicalManagementGroup],
            ['name' => 'consultations.delete', 'group' => $medicalManagementGroup],
            ['name' => 'consultations.close', 'group' => $medicalManagementGroup],
            ['name' => 'consultation-notes.view', 'group' => $medicalManagementGroup],
            ['name' => 'consultation-notes.create', 'group' => $medicalManagementGroup],
            ['name' => 'consultation-notes.edit', 'group' => $medicalManagementGroup],
            ['name' => 'consultation-notes.delete', 'group' => $medicalManagementGroup],
            ['name' => 'vaccinations.view', 'group' => $medicalManagementGroup],
            ['name' => 'vaccinations.create', 'group' => $medicalManagementGroup],
            ['name' => 'vaccinations.edit', 'group' => $medicalManagementGroup],
            ['name' => 'vaccinations.delete', 'group' => $medicalManagementGroup],
            ['name' => 'allergies.view', 'group' => $medicalManagementGroup],
            ['name' => 'allergies.create', 'group' => $medicalManagementGroup],
            ['name' => 'allergies.edit', 'group' => $medicalManagementGroup],
            ['name' => 'allergies.delete', 'group' => $medicalManagementGroup],
            ['name' => 'prescriptions.view', 'group' => $medicalManagementGroup],
            ['name' => 'prescriptions.create', 'group' => $medicalManagementGroup],
            ['name' => 'prescriptions.edit', 'group' => $medicalManagementGroup],
            ['name' => 'prescriptions.delete', 'group' => $medicalManagementGroup],
            ['name' => 'notes.view', 'group' => $medicalManagementGroup],
            ['name' => 'notes.create', 'group' => $medicalManagementGroup],
            ['name' => 'notes.edit', 'group' => $medicalManagementGroup],
            ['name' => 'notes.delete', 'group' => $medicalManagementGroup],

            // System Management
            ['name' => 'settings.view', 'group' => $systemManagementGroup],
            ['name' => 'settings.edit', 'group' => $systemManagementGroup],
            ['name' => 'logs.view', 'group' => $systemManagementGroup],
            ['name' => 'backups.create', 'group' => $systemManagementGroup],
            ['name' => 'holidays.view', 'group' => $systemManagementGroup],
            ['name' => 'holidays.create', 'group' => $systemManagementGroup],
            ['name' => 'holidays.delete', 'group' => $systemManagementGroup],
            ['name' => 'subscription-plans.view', 'group' => $systemManagementGroup],
            ['name' => 'subscription-plans.create', 'group' => $systemManagementGroup],
            ['name' => 'subscription-plans.edit', 'group' => $systemManagementGroup],
            ['name' => 'subscription-plans.delete', 'group' => $systemManagementGroup],
            ['name' => 'subscription-plans.toggle', 'group' => $systemManagementGroup],
            ['name' => 'notifications.view', 'group' => $systemManagementGroup],
            ['name' => 'notifications.delete', 'group' => $systemManagementGroup],
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
        // Admin has most permissions but NOT holidays, availability, or blogs (those are for veterinarians)
        $adminPermissions = Permission::whereNotIn('name', [
            'appointments.view',
            'appointments.create',
            'appointments.edit',
            'appointments.cancel',
            'appointments.accept',
            'appointments.report',
            'appointments.calendar',
            'availability.view',
            'availability.create',
            'availability.edit',
            'availability.delete',
            'holidays.view',
            'holidays.create',
            'holidays.delete',
            'blogs.view',
            'blogs.create',
            'blogs.edit',
            'blogs.delete',
            'products.view',
            'products.create',
            'products.edit',
            'category-products.view',
            'suppliers.view',
            'orders.view',
            'orders.create',
            'orders.edit',
        ])->get();
        
        $adminRole->givePermissionTo($adminPermissions);

        $veterinarianRole->givePermissionTo([            
            // Content Management
            'blogs.view',
            'blogs.create',
            'blogs.edit',
            'products.view',
            'products.create',
            'products.edit',
            'category-products.view',
            'category-blogs.view',
            
            // Client Management
            'clients.view',
            'clients.create',
            'clients.edit',
            'pets.view',
            'pets.create',
            'pets.edit',
            'pets.delete',
            'species.view',
            'breeds.view',
            
            // Appointment Management
            'appointments.view',
            'appointments.create',
            'appointments.edit',
            'appointments.cancel',
            'appointments.accept',
            'appointments.report',
            'appointments.calendar',
            'availability.view',
            'availability.create',
            'availability.edit',
            'availability.delete',
            'holidays.view',
            'holidays.create',
            'holidays.delete',
            
            // Inventory Management
            'suppliers.view',
            'orders.view',
            'orders.create',
            'orders.edit',
            'orders.confirm',
            'orders.receive',
            'lots.view',
            
            // Medical Management
            'consultations.view',
            'consultations.create',
            'consultations.edit',
            'consultations.close',
            'consultation-notes.view',
            'consultation-notes.create',
            'consultation-notes.edit',
            'consultation-notes.delete',
            'vaccinations.view',
            'vaccinations.create',
            'vaccinations.edit',
            'vaccinations.delete',
            'allergies.view',
            'allergies.create',
            'allergies.edit',
            'allergies.delete',
            'prescriptions.view',
            'prescriptions.create',
            'prescriptions.edit',
            'prescriptions.delete',
            'notes.view',
            'notes.create',
            'notes.edit',
            'notes.delete',
            
            // System Management
            'settings.view',
            'notifications.view',
            'notifications.delete',
        ]);

        $receptionistRole->givePermissionTo([
            // User Management
            'users.view',
            'users.create',
            'users.edit',
            
            // Content Management
            'blogs.view',
            'products.view',
            'products.create',
            'products.edit',
            'category-products.view',
            
            // Client Management
            'clients.view',
            'clients.create',
            'clients.edit',
            'pets.view',
            'pets.create',
            'pets.edit',
            'species.view',
            'breeds.view',
            
            // Appointment Management
            'appointments.view',
            'appointments.create',
            'appointments.edit',
            'appointments.cancel',
            'appointments.request',
            'appointments.calendar',
            'availability.view',
            'holidays.view',
            
            // Inventory Management
            'suppliers.view',
            'orders.view',
            'orders.create',
            'orders.edit',
            
            // System Management
            'notifications.view',
            'notifications.delete',
        ]);

        $clientRole->givePermissionTo([
            // Client Management (own data)
            'pets.view',
            'pets.create',
            'pets.edit',
            
            // Appointment Management (own appointments)
            'appointments.view',
            'appointments.create',
            'appointments.request',
            'appointments.cancel',
            
            // Medical Management (own medical records)
            'consultations.view',

            // System Management
            'notifications.view',
            'notifications.delete',
        ]);
    }
}
