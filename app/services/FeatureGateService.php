<?php

namespace App\Services;

use App\Models\SubscriptionPlan;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class FeatureGateService
{
    /**
     * Check if user can perform an action based on their subscription plan AND permissions
     */
    public function can(User $user, string $action, array $context = []): bool
    {
        // First check if user has the required permission
        if (!$this->hasPermission($user, $action)) {
            return false;
        }

        // Then check subscription limits
        $subscription = $this->getUserSubscription($user);
        
        if (!$subscription) {
            return false; // No subscription = no access
        }

        return match($action) {
            'create_user' => $this->canCreateUser($subscription, $context),
            'create_pet' => $this->canCreatePet($subscription, $context),
            'create_appointment' => $this->canCreateAppointment($subscription, $context),
            'access_advanced_features' => $this->hasAdvancedFeatures($subscription),
            'export_data' => $this->canExportData($subscription),
            'api_access' => $this->hasApiAccess($subscription),
            'custom_branding' => $this->hasCustomBranding($subscription),
            'priority_support' => $this->hasPrioritySupport($subscription),
            default => $this->checkGenericFeature($subscription, $action)
        };
    }

    /**
     * Check if user has the required permission
     */
    private function hasPermission(User $user, string $action): bool
    {
        // Map actions to permissions
        $permissionMap = $this->getPermissionMap();
        $permission = $permissionMap[$action] ?? $action;
        
        return $user->can($permission);
    }

    /**
     * Get permission mapping for actions
     */
    private function getPermissionMap(): array
    {
        return [
            'create_user' => 'users.create',
            'create_pet' => 'pets.create',
            'create_appointment' => 'appointments.create',
            'access_advanced_features' => 'features.advanced',
            'export_data' => 'data.export',
            'api_access' => 'api.access',
            'custom_branding' => 'branding.custom',
            'priority_support' => 'support.priority',
        ];
    }

    /**
     * Check generic features based on subscription plan
     */
    private function checkGenericFeature(SubscriptionPlan $plan, string $action): bool
    {
        // Check if the action is a feature in the subscription plan
        return $plan->hasFeature($action);
    }

    /**
     * Get the reason why an action is not allowed
     */
    public function getRestrictionReason(User $user, string $action, array $context = []): string
    {
        $subscription = $this->getUserSubscription($user);
        
        if (!$subscription) {
            return 'No active subscription plan';
        }

        return match($action) {
            'create_user' => $this->getUserLimitReason($subscription, $context),
            'create_pet' => $this->getPetLimitReason($subscription, $context),
            'create_appointment' => $this->getAppointmentLimitReason($subscription, $context),
            'access_advanced_features' => 'Advanced features require a higher plan',
            'export_data' => 'Data export requires a higher plan',
            'api_access' => 'API access requires a higher plan',
            'custom_branding' => 'Custom branding requires a higher plan',
            'priority_support' => 'Priority support requires a higher plan',
            default => 'Action not allowed'
        };
    }

    /**
     * Check if user can create another user
     */
    private function canCreateUser(SubscriptionPlan $plan, array $context): bool
    {
        if ($plan->isUnlimited('users')) {
            return true;
        }

        $currentCount = $this->getCurrentUserCount($context['clinic_id'] ?? null);
        $limit = $plan->getLimit('users');
        
        return $currentCount < $limit;
    }

    /**
     * Check if user can create another pet
     */
    private function canCreatePet(SubscriptionPlan $plan, array $context): bool
    {
        if ($plan->isUnlimited('pets')) {
            return true;
        }

        $currentCount = $this->getCurrentPetCount($context['clinic_id'] ?? null);
        $limit = $plan->getLimit('pets');
        
        return $currentCount < $limit;
    }

    /**
     * Check if user can create another appointment
     */
    private function canCreateAppointment(SubscriptionPlan $plan, array $context): bool
    {
        if ($plan->isUnlimited('appointments')) {
            return true;
        }

        $currentCount = $this->getCurrentAppointmentCount($context['clinic_id'] ?? null, $context['month'] ?? now()->month);
        $limit = $plan->getLimit('appointments');
        
        return $currentCount < $limit;
    }

    /**
     * Check if plan has advanced features
     */
    private function hasAdvancedFeatures(SubscriptionPlan $plan): bool
    {
        return $plan->hasFeature('advanced_analytics') || 
               $plan->hasFeature('custom_fields') || 
               $plan->hasFeature('automated_reminders');
    }

    /**
     * Check if plan allows data export
     */
    private function canExportData(SubscriptionPlan $plan): bool
    {
        return $plan->hasFeature('data_export');
    }

    /**
     * Check if plan has API access
     */
    private function hasApiAccess(SubscriptionPlan $plan): bool
    {
        return $plan->hasFeature('api_access');
    }

    /**
     * Check if plan has custom branding
     */
    private function hasCustomBranding(SubscriptionPlan $plan): bool
    {
        return $plan->hasFeature('custom_branding');
    }

    /**
     * Check if plan has priority support
     */
    private function hasPrioritySupport(SubscriptionPlan $plan): bool
    {
        return $plan->hasFeature('priority_support');
    }

    /**
     * Get current user count for a clinic
     */
    private function getCurrentUserCount(?int $clinicId): int
    {
        $query = DB::table('users');
        
        if ($clinicId) {
            $query->where('clinic_id', $clinicId);
        }
        
        return $query->count();
    }

    /**
     * Get current pet count for a clinic
     */
    private function getCurrentPetCount(?int $clinicId): int
    {
        $query = DB::table('pets');
        
        if ($clinicId) {
            $query->where('clinic_id', $clinicId);
        }
        
        return $query->count();
    }

    /**
     * Get current appointment count for a clinic in a month
     */
    private function getCurrentAppointmentCount(?int $clinicId, int $month): int
    {
        $query = DB::table('appointments')
            ->whereMonth('created_at', $month)
            ->whereYear('created_at', now()->year);
        
        if ($clinicId) {
            $query->where('clinic_id', $clinicId);
        }
        
        return $query->count();
    }

    /**
     * Get user's current subscription plan
     */
    private function getUserSubscription(User $user): ?SubscriptionPlan
    {
        // This would typically come from a user_subscriptions table
        // For now, we'll assume the user has a subscription plan
        return SubscriptionPlan::where('slug', 'basic')->first();
    }

    /**
     * Get restriction reason for user limit
     */
    private function getUserLimitReason(SubscriptionPlan $plan, array $context): string
    {
        $currentCount = $this->getCurrentUserCount($context['clinic_id'] ?? null);
        $limit = $plan->getLimit('users');
        
        return "User limit reached ({$currentCount}/{$limit}). Upgrade your plan to add more users.";
    }

    /**
     * Get restriction reason for pet limit
     */
    private function getPetLimitReason(SubscriptionPlan $plan, array $context): string
    {
        $currentCount = $this->getCurrentPetCount($context['clinic_id'] ?? null);
        $limit = $plan->getLimit('pets');
        
        return "Pet limit reached ({$currentCount}/{$limit}). Upgrade your plan to add more pets.";
    }

    /**
     * Get restriction reason for appointment limit
     */
    private function getAppointmentLimitReason(SubscriptionPlan $plan, array $context): string
    {
        $currentCount = $this->getCurrentAppointmentCount($context['clinic_id'] ?? null, $context['month'] ?? now()->month);
        $limit = $plan->getLimit('appointments');
        
        return "Monthly appointment limit reached ({$currentCount}/{$limit}). Upgrade your plan for more appointments.";
    }
}
