<?php

namespace App\Traits;

use App\Services\FeatureGateService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;

trait HandlesSubscriptionPermissions
{
    protected $featureGate;

    public function __construct(FeatureGateService $featureGate)
    {
        $this->featureGate = $featureGate;
    }

    /**
     * Check if user can perform an action (permission + subscription)
     */
    protected function canPerform(string $action, array $context = []): bool
    {
        $user = Auth::user();
        return $this->featureGate->can($user, $action, $context);
    }

    /**
     * Check if user has permission only
     */
    protected function hasPermission(string $permission): bool
    {
        $user = Auth::user();
        return $user->can($permission);
    }

    /**
     * Check if user can perform action with specific permission
     */
    protected function canPerformWithPermission(string $action, string $permission, array $context = []): bool
    {
        return $this->hasPermission($permission) && $this->canPerform($action, $context);
    }

    /**
     * Get restriction reason
     */
    protected function getRestrictionReason(string $action, array $context = []): string
    {
        $user = Auth::user();
        return $this->featureGate->getRestrictionReason($user, $action, $context);
    }

    /**
     * Abort if cannot perform action
     */
    protected function abortIfCannotPerform(string $action, array $context = []): void
    {
        if (!$this->canPerform($action, $context)) {
            $reason = $this->getRestrictionReason($action, $context);
            abort(403, $reason);
        }
    }

    /**
     * Abort if no permission
     */
    protected function abortIfNoPermission(string $permission): void
    {
        if (!$this->hasPermission($permission)) {
            abort(403, 'You do not have permission to perform this action.');
        }
    }

    /**
     * Abort if cannot perform with specific permission
     */
    protected function abortIfCannotPerformWithPermission(string $action, string $permission, array $context = []): void
    {
        if (!$this->canPerformWithPermission($action, $permission, $context)) {
            if (!$this->hasPermission($permission)) {
                abort(403, 'You do not have permission to perform this action.');
            }
            $reason = $this->getRestrictionReason($action, $context);
            abort(403, $reason);
        }
    }

    /**
     * Return JSON error response
     */
    protected function jsonError(string $message, int $status = 403, array $additional = []): JsonResponse
    {
        return response()->json(array_merge([
            'error' => true,
            'message' => $message
        ], $additional), $status);
    }

    /**
     * Return redirect with error
     */
    protected function redirectWithError(string $message, string $route = null): RedirectResponse
    {
        $redirect = $route ? redirect()->route($route) : redirect()->back();
        return $redirect->with('error', $message);
    }

    /**
     * Get user's subscription status
     */
    protected function getSubscriptionStatus(): array
    {
        $user = Auth::user();
        $subscription = $this->getUserSubscription($user);
        
        if (!$subscription) {
            return [
                'has_subscription' => false,
                'plan' => null,
                'limits' => [],
                'features' => []
            ];
        }

        return [
            'has_subscription' => true,
            'plan' => [
                'name' => $subscription->localized_name,
                'slug' => $subscription->slug,
                'price' => $subscription->price,
                'currency' => $subscription->currency,
                'billing_period' => $subscription->billing_period,
            ],
            'limits' => [
                'users' => $subscription->getLimit('users'),
                'pets' => $subscription->getLimit('pets'),
                'appointments' => $subscription->getLimit('appointments'),
            ],
            'features' => $subscription->getLocalizedFeaturesAttribute(),
        ];
    }

    /**
     * Get current usage for context
     */
    protected function getCurrentUsage(array $context = []): array
    {
        $clinicId = $context['clinic_id'] ?? Auth::user()->clinic_id ?? null;
        
        return [
            'users' => $this->getCurrentUserCount($clinicId),
            'pets' => $this->getCurrentPetCount($clinicId),
            'appointments' => $this->getCurrentAppointmentCount($clinicId),
        ];
    }

    /**
     * Get feature status for frontend
     */
    protected function getFeatureStatus(): array
    {
        $user = Auth::user();
        $subscription = $this->getUserSubscription($user);
        
        $features = [
            'can_create_user' => $this->canPerform('create_user'),
            'can_create_pet' => $this->canPerform('create_pet'),
            'can_create_appointment' => $this->canPerform('create_appointment'),
            'has_advanced_features' => $this->canPerform('access_advanced_features'),
            'can_export_data' => $this->canPerform('export_data'),
            'has_api_access' => $this->canPerform('api_access'),
            'has_custom_branding' => $this->canPerform('custom_branding'),
            'has_priority_support' => $this->canPerform('priority_support'),
        ];

        // Add dynamic features from subscription plan
        if ($subscription) {
            $planFeatures = $subscription->getLocalizedFeaturesAttribute();
            foreach ($planFeatures as $feature) {
                $featureKey = 'has_' . str_replace(' ', '_', strtolower($feature));
                $features[$featureKey] = true;
            }
        }

        return $features;
    }

    /**
     * Helper methods for getting current counts
     */
    private function getCurrentUserCount(?int $clinicId): int
    {
        $query = \DB::table('users');
        if ($clinicId) {
            $query->where('clinic_id', $clinicId);
        }
        return $query->count();
    }

    private function getCurrentPetCount(?int $clinicId): int
    {
        $query = \DB::table('pets');
        if ($clinicId) {
            $query->where('clinic_id', $clinicId);
        }
        return $query->count();
    }

    private function getCurrentAppointmentCount(?int $clinicId): int
    {
        $query = \DB::table('appointments')
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year);
        
        if ($clinicId) {
            $query->where('clinic_id', $clinicId);
        }
        
        return $query->count();
    }

    private function getUserSubscription($user)
    {
        // This would typically come from a user_subscriptions table
        // For now, we'll assume the user has a subscription plan
        return \App\Models\SubscriptionPlan::where('slug', 'basic')->first();
    }
}
