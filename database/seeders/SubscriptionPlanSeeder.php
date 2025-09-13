<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\SubscriptionPlan;
use App\Models\PermissionGroup;
use App\Models\Feature;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Str;

class SubscriptionPlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Seeding subscription plans...');

        // Create permissions first
        $this->createPermissions();

        // Create subscription plans
        $this->createSubscriptionPlans();

        $this->command->info('Subscription plans seeded successfully!');
    }

    private function createPermissions()
    {
        // Create or get subscription management group
        $subscriptionGroup = PermissionGroup::firstOrCreate(
            ['name' => 'Subscription Management'],
            ['uuid' => Str::uuid()]
        );

        // Create subscription-specific permissions
        $permissions = [
            ['name' => 'subscription.view', 'group' => $subscriptionGroup],
            ['name' => 'subscription.manage', 'group' => $subscriptionGroup],
            ['name' => 'subscription.upgrade', 'group' => $subscriptionGroup],
            ['name' => 'features.basic', 'group' => $subscriptionGroup],
            ['name' => 'features.advanced', 'group' => $subscriptionGroup],
            ['name' => 'features.premium', 'group' => $subscriptionGroup],
            ['name' => 'limits.users', 'group' => $subscriptionGroup],
            ['name' => 'limits.pets', 'group' => $subscriptionGroup],
            ['name' => 'limits.appointments', 'group' => $subscriptionGroup],
            ['name' => 'limits.unlimited', 'group' => $subscriptionGroup],
            ['name' => 'data.export', 'group' => $subscriptionGroup],
            ['name' => 'data.import', 'group' => $subscriptionGroup],
            ['name' => 'data.backup', 'group' => $subscriptionGroup],
            ['name' => 'api.access', 'group' => $subscriptionGroup],
            ['name' => 'api.unlimited', 'group' => $subscriptionGroup],
            ['name' => 'branding.custom', 'group' => $subscriptionGroup],
            ['name' => 'branding.white_label', 'group' => $subscriptionGroup],
            ['name' => 'support.basic', 'group' => $subscriptionGroup],
            ['name' => 'support.priority', 'group' => $subscriptionGroup],
            ['name' => 'support.dedicated', 'group' => $subscriptionGroup],
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate([
                'name' => $permission['name'],
                'guard_name' => 'web',
            ], [
                'uuid' => Str::uuid(),
                'grp_id' => $permission['group']->id,
            ]);
        }

        $this->command->info('Created ' . count($permissions) . ' subscription permissions');
    }

    private function createSubscriptionPlans()
    {
        $plans = [
            [
                'name' => [
                    'en' => 'Free Plan',
                    'ar' => 'الخطة المجانية',
                    'fr' => 'Plan Gratuit'
                ],
                'description' => [
                    'en' => 'Perfect for getting started with basic veterinary management',
                    'ar' => 'مثالي للبدء في إدارة الطب البيطري الأساسية',
                    'fr' => 'Parfait pour commencer avec la gestion vétérinaire de base'
                ],
                'price' => 0,
                    'yearly_price' => 0,
                'max_clients' => 5,
                'max_pets' => 50,
                'max_appointments' => 100,
                'is_active' => true,
                'is_popular' => false,
                'sort_order' => 1,
                'permissions' => [
                    'subscription.view',
                    'features.basic',
                    'limits.users',
                    'limits.pets',
                    'limits.appointments',
                    'support.basic'
                ],
                'selected_features' => [
                    'appointment-reminders'
                ]
            ],
            [
                'name' => [
                    'en' => 'Basic Plan',
                    'ar' => 'الخطة الأساسية',
                    'fr' => 'Plan de Base'
                ],
                'description' => [
                    'en' => 'Great for small clinics with growing needs',
                    'ar' => 'رائع للعيادات الصغيرة ذات الاحتياجات المتزايدة',
                    'fr' => 'Parfait pour les petites cliniques avec des besoins croissants'
                ],
                'price' => 29.99,
                'yearly_price' => 299.99,
                'max_clients' => 25,
                'max_pets' => 500,
                'max_appointments' => 1000,
                'is_active' => true,
                'is_popular' => true,
                'sort_order' => 2,
                'permissions' => [
                    'subscription.view',
                    'subscription.manage',
                    'features.basic',
                    'features.advanced',
                    'limits.users',
                    'limits.pets',
                    'limits.appointments',
                    'data.export',
                    'support.priority'
                ],
                'selected_features' => [
                    'client-import-export',
                    'calendar-sync',
                    'appointment-reminders',
                    'recurring-appointments',
                    'digital-prescriptions',
                    'invoicing',
                    'payment-tracking',
                    'sms-notifications',
                    'email-marketing'
                ]
            ],
            [
                'name' => [
                    'en' => 'Premium Plan',
                    'ar' => 'الخطة المميزة',
                    'fr' => 'Plan Premium'
                ],
                'description' => [
                    'en' => 'Perfect for growing clinics with advanced needs',
                    'ar' => 'مثالي للعيادات النامية ذات الاحتياجات المتقدمة',
                    'fr' => 'Parfait pour les cliniques en croissance avec des besoins avancés'
                ],
                'price' => 99.99,
                'yearly_price' => 999.99,
                'max_clients' => null, // Unlimited
                'max_pets' => null, // Unlimited
                'max_appointments' => null, // Unlimited
                'is_active' => true,
                'is_popular' => false,
                'sort_order' => 3,
                'permissions' => [
                    'subscription.view',
                    'subscription.manage',
                    'subscription.upgrade',
                    'features.basic',
                    'features.advanced',
                    'features.premium',
                    'limits.unlimited',
                    'data.export',
                    'data.import',
                    'data.backup',
                    'api.access',
                    'api.unlimited',
                    'branding.custom',
                    'branding.white_label',
                    'support.priority',
                    'support.dedicated'
                ],
                'selected_features' => [
                    'client-import-export',
                    'video-calls',
                    'calendar-sync',
                    'appointment-reminders',
                    'recurring-appointments',
                    'digital-prescriptions',
                    'invoicing',
                    'payment-tracking',
                    'financial-reports',
                    'sms-notifications',
                    'email-marketing',
                    'push-notifications'
                ]
            ]
        ];

        foreach ($plans as $planData) {
            $permissions = $planData['permissions'];
            $selectedFeatures = $planData['selected_features'] ?? [];
            unset($planData['permissions']);
            unset($planData['selected_features']);

            // Add UUID to plan data
            $planData['uuid'] = Str::uuid();

            $plan = SubscriptionPlan::create($planData);

            // Sync selected features to the plan
            if (!empty($selectedFeatures)) {
                $featureObjects = Feature::whereIn('slug', $selectedFeatures)->get();
                $plan->planFeatures()->sync($featureObjects->pluck('id'));
            }

            // Create role for this subscription plan
            $roleName = "subscription_plan_{$plan->id}";
            $role = Role::firstOrCreate([
                'name' => $roleName,
                'guard_name' => 'web',
                'uuid' => Str::uuid()
            ]);

            // Get permission objects
            $permissionObjects = Permission::whereIn('name', $permissions)->get();
            
            // Sync permissions to role
            $role->syncPermissions($permissionObjects);

            $this->command->info("Created plan '{$plan->name['en']}' with role '{$roleName}' and " . count($permissions) . " permissions and " . count($selectedFeatures) . " features");
        }
    }
}
