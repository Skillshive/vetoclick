<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SubscriptionPlan extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'uuid',
        'slug',
        'name',
        'description',
        'features',
        'price',
        'currency',
        'billing_period',
        'trial_days',
        'max_users',
        'max_pets',
        'max_appointments',
        'is_active',
        'is_popular',
        'sort_order',
    ];

    protected $casts = [
        'name' => 'array',
        'description' => 'array',
        'features' => 'array',
        'price' => 'decimal:2',
        'is_active' => 'boolean',
        'is_popular' => 'boolean',
        'trial_days' => 'integer',
        'max_users' => 'integer',
        'max_pets' => 'integer',
        'max_appointments' => 'integer',
        'sort_order' => 'integer',
    ];

    /**
     * Get the localized name for the current locale
     */
    public function getLocalizedNameAttribute(): string
    {
        $locale = app()->getLocale();
        return $this->name[$locale] ?? $this->name['en'] ?? 'Unknown Plan';
    }

    /**
     * Get the localized description for the current locale
     */
    public function getLocalizedDescriptionAttribute(): string
    {
        $locale = app()->getLocale();
        return $this->description[$locale] ?? $this->description['en'] ?? '';
    }

    /**
     * Get the localized features for the current locale
     */
    public function getLocalizedFeaturesAttribute(): array
    {
        $locale = app()->getLocale();
        return $this->features[$locale] ?? $this->features['en'] ?? [];
    }

    /**
     * Check if plan has a specific feature
     */
    public function hasFeature(string $feature): bool
    {
        $features = $this->getLocalizedFeaturesAttribute();
        return in_array($feature, $features);
    }

    /**
     * Check if plan allows unlimited for a specific resource
     */
    public function isUnlimited(string $resource): bool
    {
        $limit = $this->{"max_{$resource}"};
        return $limit === null || $limit === -1;
    }

    /**
     * Get the limit for a specific resource
     */
    public function getLimit(string $resource): ?int
    {
        return $this->{"max_{$resource}"};
    }

    /**
     * Scope for active plans
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for popular plans
     */
    public function scopePopular($query)
    {
        return $query->where('is_popular', true);
    }

    /**
     * Scope ordered by sort_order
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('price');
    }
}
