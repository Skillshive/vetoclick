<?php

namespace App\Services;

use App\Models\SubscriptionPlan;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

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
        \Log::info('SubscriptionPlanService::create - Incoming data:', $data);
        
        // Transform flattened data to nested structure
        $transformedData = $this->transformData($data);
        
        \Log::info('SubscriptionPlanService::create - Transformed data:', $transformedData);
        
        $plan = SubscriptionPlan::create($transformedData);
        
        \Log::info('SubscriptionPlanService::create - Created plan:', ['id' => $plan->id, 'uuid' => $plan->uuid]);
        
        // Sync selected features if provided
        if (isset($data['selected_features']) && is_array($data['selected_features'])) {
            // Get the actual feature IDs from UUIDs
            $featureIds = \App\Models\Feature::whereIn('uuid', $data['selected_features'])->pluck('id')->toArray();
            $plan->planFeatures()->sync($featureIds);
            \Log::info('SubscriptionPlanService::create - Synced features:', ['uuids' => $data['selected_features'], 'ids' => $featureIds]);
        }
        
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
}
