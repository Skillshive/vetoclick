<?php

namespace App\Services;

use App\Models\SubscriptionPlan;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Log;

class SubscriptionPlanService
{
    /**
     * Get a query builder for subscription plans
     */
    public function query(): Builder
    {
        return SubscriptionPlan::query();
    }

    /**
     * Get all subscription plans
     */
    public function getAll(): Collection
    {
        return $this->query()->orderBy('sort_order')->orderBy('created_at', 'desc')->get();
    }

    /**
     * Get active subscription plans
     */
    public function getActive(): Collection
    {
        return $this->query()->where('is_active', true)->orderBy('sort_order')->get();
    }

    /**
     * Get popular subscription plans
     */
    public function getPopular(): Collection
    {
        return $this->query()->where('is_popular', true)->where('is_active', true)->orderBy('sort_order')->get();
    }

    /**
     * Create a new subscription plan
     */
    public function create(array $data): SubscriptionPlan
    {
        // Log the incoming data for debugging
        Log::info('SubscriptionPlanService::create - Incoming data:', $data);
        
        // Transform flattened data to nested structure
        $transformedData = $this->transformData($data);
        
        Log::info('SubscriptionPlanService::create - Transformed data:', $transformedData);
        
        $plan = SubscriptionPlan::create($transformedData);
        
        Log::info('SubscriptionPlanService::create - Created plan:', ['id' => $plan->id, 'uuid' => $plan->uuid]);
        
        // Sync selected features if provided
        if (isset($data['selected_features']) && is_array($data['selected_features'])) {
            // Get the actual feature IDs from UUIDs
            $featureIds = \App\Models\Feature::whereIn('uuid', $data['selected_features'])->pluck('id')->toArray();
            $plan->planFeatures()->sync($featureIds);
            Log::info('SubscriptionPlanService::create - Synced features:', ['uuids' => $data['selected_features'], 'ids' => $featureIds]);
        }
        
        // Create or update role for this subscription plan and assign permissions
        $this->syncPlanPermissions($plan, $data['selected_features'] ?? []);
        
        return $plan;
    }

    /**
     * Update a subscription plan
     */
    public function update(SubscriptionPlan $plan, array $data): SubscriptionPlan
    {
        // Transform flattened data to nested structure
        $transformedData = $this->transformData($data);
        
        $plan->update($transformedData);
        
        // Sync selected features if provided
        if (isset($data['selected_features']) && is_array($data['selected_features'])) {
            // Get the actual feature IDs from UUIDs
            $featureIds = \App\Models\Feature::whereIn('uuid', $data['selected_features'])->pluck('id')->toArray();
            $plan->planFeatures()->sync($featureIds);
        }
        
        // Update role permissions for this subscription plan
        $this->syncPlanPermissions($plan, $data['selected_features'] ?? []);
        
        return $plan->fresh();
    }

    /**
     * Transform flattened form data to nested structure for database
     */
    private function transformData(array $data): array
    {
        $transformed = [];
        
        // Transform name fields
        if (isset($data['name_en']) || isset($data['name_ar']) || isset($data['name_fr'])) {
            $transformed['name'] = [
                'en' => $data['name_en'] ?? '',
                'ar' => $data['name_ar'] ?? '',
                'fr' => $data['name_fr'] ?? '',
            ];
        }
        
        // Transform description fields
        if (isset($data['description_en']) || isset($data['description_ar']) || isset($data['description_fr'])) {
            $transformed['description'] = [
                'en' => $data['description_en'] ?? '',
                'ar' => $data['description_ar'] ?? '',
                'fr' => $data['description_fr'] ?? '',
            ];
        }
        
        // Transform features fields
        if (isset($data['features_en']) || isset($data['features_ar']) || isset($data['features_fr'])) {
            $transformed['features'] = [
                'en' => $data['features_en'] ?? [],
                'ar' => $data['features_ar'] ?? [],
                'fr' => $data['features_fr'] ?? [],
            ];
        }
        
        // Copy other fields as-is
        $otherFields = ['price', 'yearly_price', 'max_clients', 'max_pets', 'max_appointments', 'is_active', 'is_popular', 'sort_order'];
        foreach ($otherFields as $field) {
            if (isset($data[$field])) {
                $transformed[$field] = $data[$field];
            }
        }
        
        return $transformed;
    }

    /**
     * Delete a subscription plan
     */
    public function delete(SubscriptionPlan $plan): bool
    {
        return $plan->delete();
    }

    /**
     * Find a subscription plan by UUID
     */
    public function findByUuid(string $uuid): ?SubscriptionPlan
    {
        return $this->query()->where('uuid', $uuid)->first();
    }

    /**
     * Find a subscription plan by slug
     */
    public function findBySlug(string $slug): ?SubscriptionPlan
    {
        return $this->query()->where('slug', $slug)->first();
    }

    /**
     * Search subscription plans
     */
    public function search(Builder $query, string $search): Builder
    {
        return $query->where(function ($q) use ($search) {
            $q->whereRaw("JSON_EXTRACT(name, '$.en') LIKE ?", ["%{$search}%"])
              ->orWhereRaw("JSON_EXTRACT(name, '$.ar') LIKE ?", ["%{$search}%"])
              ->orWhereRaw("JSON_EXTRACT(name, '$.fr') LIKE ?", ["%{$search}%"])
              ->orWhereRaw("JSON_EXTRACT(description, '$.en') LIKE ?", ["%{$search}%"])
              ->orWhereRaw("JSON_EXTRACT(description, '$.ar') LIKE ?", ["%{$search}%"])
              ->orWhereRaw("JSON_EXTRACT(description, '$.fr') LIKE ?", ["%{$search}%"]);
        });
    }

    /**
     * Get subscription plans with pagination
     */
    public function paginate(Builder $query, int $perPage = 12, int $page = 1): LengthAwarePaginator
    {
        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Sync permissions for a subscription plan based on selected features
     */
    private function syncPlanPermissions(SubscriptionPlan $plan, array $selectedFeatureUuids): void
    {
        // Create or get role for this subscription plan
        $roleName = "subscription_plan_{$plan->id}";
        $role = \Spatie\Permission\Models\Role::firstOrCreate([
            'name' => $roleName,
            'guard_name' => 'web',
        ], [
            'uuid' => \Illuminate\Support\Str::uuid()
        ]);

        // Get selected features with their slugs
        $selectedFeatures = \App\Models\Feature::whereIn('uuid', $selectedFeatureUuids)->get();
        
        // Map feature slugs to permissions
        $permissionMapping = $this->getFeaturePermissionMapping();
        
        $permissionsToAssign = [];
        foreach ($selectedFeatures as $feature) {
            if (isset($permissionMapping[$feature->slug])) {
                $permissionsToAssign = array_merge($permissionsToAssign, $permissionMapping[$feature->slug]);
            }
        }
        
        // Remove duplicates
        $permissionsToAssign = array_unique($permissionsToAssign);
        
        // Get permission objects
        $permissionObjects = \Spatie\Permission\Models\Permission::whereIn('name', $permissionsToAssign)->get();
        
        // Sync permissions to role
        $role->syncPermissions($permissionObjects);
        
        Log::info('SubscriptionPlanService::syncPlanPermissions - Synced permissions:', [
            'plan_id' => $plan->id,
            'role_name' => $roleName,
            'permissions_count' => count($permissionsToAssign),
            'permissions' => $permissionsToAssign
        ]);
    }

    /**
     * Map feature slugs to their required permissions
     */
    private function getFeaturePermissionMapping(): array
    {
        return [
            // Client Management
            'client-management' => [
                'clients.view', 'clients.create', 'clients.edit', 'clients.delete'
            ],
            'pet-management' => [
                'pets.view', 'pets.create', 'pets.edit', 'pets.delete',
                'species.view', 'breeds.view'
            ],
            
            // Appointment Scheduling
            'appointment-management' => [
                'appointments.view', 'appointments.create', 'appointments.edit', 
                'appointments.delete', 'appointments.cancel', 'appointments.accept',
                'appointments.report', 'appointments.request', 'appointments.calendar',
                'appointments.create_from_page'
            ],
            'calendar-sync' => [
                'appointments.calendar'
            ],
            'appointment-reminders' => [
                'appointments.view'
            ],
            'recurring-appointments' => [
                'appointments.view', 'appointments.create'
            ],
            'availability-management' => [
                'availability.view', 'availability.create', 'availability.edit', 'availability.delete',
                'holidays.view', 'holidays.create', 'holidays.delete'
            ],
            
            // Video Consultations
            'video-calls' => [
                'appointments.view'
            ],
            
            // Medical Records
            'consultation-management' => [
                'consultations.view', 'consultations.create', 'consultations.edit', 
                'consultations.delete', 'consultations.close'
            ],
            'digital-prescriptions' => [
                'prescriptions.view', 'prescriptions.create', 'prescriptions.edit', 'prescriptions.delete'
            ],
            'vaccination-tracking' => [
                'vaccinations.view', 'vaccinations.create', 'vaccinations.edit', 'vaccinations.delete'
            ],
            'medical-history' => [
                'notes.view', 'notes.create', 'notes.edit', 'notes.delete',
                'consultation-notes.view', 'consultation-notes.create', 
                'consultation-notes.edit', 'consultation-notes.delete',
                'allergies.view', 'allergies.create', 'allergies.edit', 'allergies.delete'
            ],
            
            // Inventory & Stock Management
            'product-management' => [
                'products.view', 'products.create', 'products.edit', 'products.delete',
                'category-products.view', 'category-products.create', 
                'category-products.edit', 'category-products.delete'
            ],
            'stock-tracking' => [
                'products.view', 'lots.view', 'lots.create', 'lots.edit', 'lots.delete'
            ],
            'low-stock-alerts' => [
                'products.view'
            ],
            
            // Ordering & Supplier System
            'supplier-management' => [
                'suppliers.view', 'suppliers.create', 'suppliers.edit', 'suppliers.delete',
                'suppliers.export', 'suppliers.import'
            ],
            'purchase-orders' => [
                'orders.view', 'orders.create', 'orders.edit', 'orders.delete'
            ],
            'order-tracking' => [
                'orders.view', 'orders.confirm', 'orders.receive', 'orders.cancel'
            ],
            
            // Billing & Invoicing
            'payment-tracking' => [],
            'financial-reports' => [
                'appointments.report', 'products.export'
            ],
            
            // Communication Tools
            'sms-notifications' => [],
            
            // Content & Blog Management
            'blog-management' => [
                'blogs.view', 'blogs.create', 'blogs.edit', 'blogs.delete', 'blogs.search',
                'category-blogs.view', 'category-blogs.create', 
                'category-blogs.edit', 'category-blogs.delete'
            ],
            'educational-content' => [
                'blogs.view'
            ],
            
            // User & Role Management
            'staff-management' => [
                'users.view', 'users.create', 'users.edit', 'users.delete'
            ],
            'role-permissions' => [
                'roles.view', 'roles.create', 'roles.edit', 'roles.delete',
                'roles.assign-permissions', 'permissions.view', 'permissions.create',
                'permissions.edit', 'permissions.delete'
            ],
            
            // System Settings
            'system-configuration' => [
                'settings.view', 'settings.edit'
            ],
        ];
    }
}
