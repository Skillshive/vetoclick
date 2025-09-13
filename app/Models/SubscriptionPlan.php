<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class SubscriptionPlan extends Model
{
    use HasFactory, HasUuids;

    protected $primaryKey = 'id';
    protected $keyType = 'int';

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($plan) {
            $plan->uuid = Str::uuid();
        });
    }
    /**
     * Get the columns that should receive a unique identifier.
     */
    public function uniqueIds()
    {
        return ['uuid'];
    }

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName()
    {
        return 'uuid';
    }

    protected $fillable = [
        'uuid',
        'name',
        'description',
        'price',
        'yearly_price',
        'max_clients',
        'max_pets',
        'max_appointments',
        'is_active',
        'is_popular',
        'sort_order',
    ];

    protected $casts = [
        'name' => 'array',
        'description' => 'array',
        'price' => 'decimal:2',
        'yearly_price' => 'decimal:2',
        'is_active' => 'boolean',
        'is_popular' => 'boolean',
        'max_clients' => 'integer',
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

    /**
     * Get the features for this subscription plan
     */
    public function planFeatures()
    {
        return $this->belongsToMany(Feature::class, 'subscription_plan_features', 'subscription_plan_id', 'feature_id');
    }

    /**
     * Get the effective price based on billing period
     */
    public function getEffectivePriceAttribute(): float
    {
        return $this->billing_period === 'yearly' && $this->yearly_price 
            ? $this->yearly_price 
            : $this->price;
    }

    /**
     * Get the yearly savings percentage
     */
    public function getYearlySavingsAttribute(): ?float
    {
        if (!$this->yearly_price) {
            return null;
        }
        
        $yearlyEquivalent = $this->price * 12;
        return round((($yearlyEquivalent - $this->yearly_price) / $yearlyEquivalent) * 100, 1);
    }

    public function features()
    {
        return $this->belongsToMany(Feature::class, 'subscription_plan_features', 'subscription_plan_id', 'feature_id');
    }
}
