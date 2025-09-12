<?php

namespace App\Traits;

use App\Services\FeatureGateService;
use Illuminate\Support\Facades\Auth;

trait ChecksSubscriptionFeatures
{
    protected $featureGate;

    public function __construct(FeatureGateService $featureGate)
    {
        $this->featureGate = $featureGate;
    }

    /**
     * Check if user can perform an action
     */
    protected function can(string $action, array $context = []): bool
    {
        $user = Auth::user();
        return $this->featureGate->can($user, $action, $context);
    }

    /**
     * Get restriction reason for an action
     */
    protected function getRestrictionReason(string $action, array $context = []): string
    {
        $user = Auth::user();
        return $this->featureGate->getRestrictionReason($user, $action, $context);
    }

    /**
     * Check if user can create users
     */
    protected function canCreateUser(array $context = []): bool
    {
        return $this->can('create_user', $context);
    }

    /**
     * Check if user can create pets
     */
    protected function canCreatePet(array $context = []): bool
    {
        return $this->can('create_pet', $context);
    }

    /**
     * Check if user can create appointments
     */
    protected function canCreateAppointment(array $context = []): bool
    {
        return $this->can('create_appointment', $context);
    }

    /**
     * Check if user has advanced features
     */
    protected function hasAdvancedFeatures(): bool
    {
        return $this->can('access_advanced_features');
    }

    /**
     * Check if user can export data
     */
    protected function canExportData(): bool
    {
        return $this->can('export_data');
    }

    /**
     * Check if user has API access
     */
    protected function hasApiAccess(): bool
    {
        return $this->can('api_access');
    }

    /**
     * Check if user has custom branding
     */
    protected function hasCustomBranding(): bool
    {
        return $this->can('custom_branding');
    }

    /**
     * Check if user has priority support
     */
    protected function hasPrioritySupport(): bool
    {
        return $this->can('priority_support');
    }

    /**
     * Abort if user cannot perform action
     */
    protected function abortIfCannot(string $action, array $context = []): void
    {
        if (!$this->can($action, $context)) {
            $reason = $this->getRestrictionReason($action, $context);
            abort(403, $reason);
        }
    }

    /**
     * Get feature status for frontend
     */
    protected function getFeatureStatus(): array
    {
        $user = Auth::user();
        
        return [
            'can_create_user' => $this->canCreateUser(),
            'can_create_pet' => $this->canCreatePet(),
            'can_create_appointment' => $this->canCreateAppointment(),
            'has_advanced_features' => $this->hasAdvancedFeatures(),
            'can_export_data' => $this->canExportData(),
            'has_api_access' => $this->hasApiAccess(),
            'has_custom_branding' => $this->hasCustomBranding(),
            'has_priority_support' => $this->hasPrioritySupport(),
        ];
    }
}
