<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\SubscriptionPlan;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class SeedSubscriptionPermissions extends Command
{
    protected $signature = 'subscription:seed-permissions';
    protected $description = 'Seed permissions based on subscription plans';

    public function handle()
    {
        $this->info('Seeding subscription-based permissions...');

        // Define permission groups and their permissions
        $permissionGroups = [
            'subscription' => [
                'subscription.view',
                'subscription.manage',
                'subscription.upgrade',
            ],
            'features' => [
                'features.basic',
                'features.advanced',
                'features.premium',
            ],
            'limits' => [
                'limits.users',
                'limits.pets',
                'limits.appointments',
                'limits.unlimited',
            ],
            'data' => [
                'data.export',
                'data.import',
                'data.backup',
            ],
            'api' => [
                'api.access',
                'api.unlimited',
            ],
            'branding' => [
                'branding.custom',
                'branding.white_label',
            ],
            'support' => [
                'support.basic',
                'support.priority',
                'support.dedicated',
            ]
        ];

        // Create permissions
        foreach ($permissionGroups as $group => $permissions) {
            foreach ($permissions as $permission) {
                Permission::firstOrCreate([
                    'name' => $permission,
                    'guard_name' => 'web'
                ]);
            }
        }

        // Create subscription plans with their permissions
        $this->createSubscriptionPlans();

        $this->info('Subscription permissions seeded successfully!');
    }

    private function createSubscriptionPlans()
    {
        $plans = [
            [
                'slug' => 'free',
                'name' => [
                    'en' => 'Free Plan',
                    'ar' => 'الخطة المجانية',
                    'fr' => 'Plan Gratuit'
                ],
                'description' => [
                    'en' => 'Perfect for getting started',
                    'ar' => 'مثالي للبدء',
                    'fr' => 'Parfait pour commencer'
                ],
                'features' => [
                    'en' => [
                        'Up to 5 users',
                        'Up to 50 pets',
                        'Basic appointments',
                        'Email support'
                    ],
                    'ar' => [
                        'حتى 5 مستخدمين',
                        'حتى 50 حيوان أليف',
                        'المواعيد الأساسية',
                        'دعم البريد الإلكتروني'
                    ],
                    'fr' => [
                        'Jusqu\'à 5 utilisateurs',
                        'Jusqu\'à 50 animaux',
                        'Rendez-vous de base',
                        'Support par email'
                    ]
                ],
                'price' => 0,
                'currency' => 'USD',
                'billing_period' => 'monthly',
                'max_users' => 5,
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
                ]
            ],
            [
                'slug' => 'basic',
                'name' => [
                    'en' => 'Basic Plan',
                    'ar' => 'الخطة الأساسية',
                    'fr' => 'Plan de Base'
                ],
                'description' => [
                    'en' => 'Great for small clinics',
                    'ar' => 'رائع للعيادات الصغيرة',
                    'fr' => 'Parfait pour les petites cliniques'
                ],
                'features' => [
                    'en' => [
                        'Up to 25 users',
                        'Up to 500 pets',
                        'Advanced appointments',
                        'Priority support',
                        'Data export'
                    ],
                    'ar' => [
                        'حتى 25 مستخدم',
                        'حتى 500 حيوان أليف',
                        'مواعيد متقدمة',
                        'دعم أولوي',
                        'تصدير البيانات'
                    ],
                    'fr' => [
                        'Jusqu\'à 25 utilisateurs',
                        'Jusqu\'à 500 animaux',
                        'Rendez-vous avancés',
                        'Support prioritaire',
                        'Export de données'
                    ]
                ],
                'price' => 29.99,
                'currency' => 'USD',
                'billing_period' => 'monthly',
                'max_users' => 25,
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
                ]
            ],
            [
                'slug' => 'premium',
                'name' => [
                    'en' => 'Premium Plan',
                    'ar' => 'الخطة المميزة',
                    'fr' => 'Plan Premium'
                ],
                'description' => [
                    'en' => 'Perfect for growing clinics',
                    'ar' => 'مثالي للعيادات النامية',
                    'fr' => 'Parfait pour les cliniques en croissance'
                ],
                'features' => [
                    'en' => [
                        'Unlimited users',
                        'Unlimited pets',
                        'Unlimited appointments',
                        'API access',
                        'Custom branding',
                        'Dedicated support'
                    ],
                    'ar' => [
                        'مستخدمون غير محدودون',
                        'حيوانات أليفة غير محدودة',
                        'مواعيد غير محدودة',
                        'وصول API',
                        'علامة تجارية مخصصة',
                        'دعم مخصص'
                    ],
                    'fr' => [
                        'Utilisateurs illimités',
                        'Animaux illimités',
                        'Rendez-vous illimités',
                        'Accès API',
                        'Marque personnalisée',
                        'Support dédié'
                    ]
                ],
                'price' => 99.99,
                'currency' => 'USD',
                'billing_period' => 'monthly',
                'max_users' => null, // Unlimited
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
                ]
            ]
        ];

        foreach ($plans as $planData) {
            $permissions = $planData['permissions'];
            unset($planData['permissions']);

            $plan = SubscriptionPlan::updateOrCreate(
                ['slug' => $planData['slug']],
                $planData
            );

            // Assign permissions to the plan
            $this->assignPermissionsToPlan($plan, $permissions);
        }
    }

    private function assignPermissionsToPlan(SubscriptionPlan $plan, array $permissions)
    {
        // Create a role for this subscription plan
        $roleName = "subscription_{$plan->slug}";
        $role = Role::firstOrCreate([
            'name' => $roleName,
            'guard_name' => 'web'
        ]);

        // Get permission objects
        $permissionObjects = Permission::whereIn('name', $permissions)->get();
        
        // Sync permissions to role
        $role->syncPermissions($permissionObjects);

        $this->info("Created role '{$roleName}' with " . count($permissions) . " permissions");
    }
}
