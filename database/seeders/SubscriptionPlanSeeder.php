<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\SubscriptionPlan;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

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
        $permissions = [
            'subscription.view',
            'subscription.manage',
            'subscription.upgrade',
            'features.basic',
            'features.advanced',
            'features.premium',
            'limits.users',
            'limits.pets',
            'limits.appointments',
            'limits.unlimited',
            'data.export',
            'data.import',
            'data.backup',
            'api.access',
            'api.unlimited',
            'branding.custom',
            'branding.white_label',
            'support.basic',
            'support.priority',
            'support.dedicated',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate([
                'name' => $permission,
                'guard_name' => 'web'
            ]);
        }

        $this->command->info('Created ' . count($permissions) . ' permissions');
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
                    'en' => 'Perfect for getting started with basic veterinary management',
                    'ar' => 'مثالي للبدء في إدارة الطب البيطري الأساسية',
                    'fr' => 'Parfait pour commencer avec la gestion vétérinaire de base'
                ],
                'features' => [
                    'en' => [
                        'Up to 5 users',
                        'Up to 50 pets',
                        'Basic appointments',
                        'Email support',
                        'Basic reporting'
                    ],
                    'ar' => [
                        'حتى 5 مستخدمين',
                        'حتى 50 حيوان أليف',
                        'المواعيد الأساسية',
                        'دعم البريد الإلكتروني',
                        'التقارير الأساسية'
                    ],
                    'fr' => [
                        'Jusqu\'à 5 utilisateurs',
                        'Jusqu\'à 50 animaux',
                        'Rendez-vous de base',
                        'Support par email',
                        'Rapports de base'
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
                    'en' => 'Great for small clinics with growing needs',
                    'ar' => 'رائع للعيادات الصغيرة ذات الاحتياجات المتزايدة',
                    'fr' => 'Parfait pour les petites cliniques avec des besoins croissants'
                ],
                'features' => [
                    'en' => [
                        'Up to 25 users',
                        'Up to 500 pets',
                        'Advanced appointments',
                        'Priority support',
                        'Data export',
                        'Advanced reporting',
                        'Email notifications'
                    ],
                    'ar' => [
                        'حتى 25 مستخدم',
                        'حتى 500 حيوان أليف',
                        'مواعيد متقدمة',
                        'دعم أولوي',
                        'تصدير البيانات',
                        'تقارير متقدمة',
                        'إشعارات البريد الإلكتروني'
                    ],
                    'fr' => [
                        'Jusqu\'à 25 utilisateurs',
                        'Jusqu\'à 500 animaux',
                        'Rendez-vous avancés',
                        'Support prioritaire',
                        'Export de données',
                        'Rapports avancés',
                        'Notifications par email'
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
                    'en' => 'Perfect for growing clinics with advanced needs',
                    'ar' => 'مثالي للعيادات النامية ذات الاحتياجات المتقدمة',
                    'fr' => 'Parfait pour les cliniques en croissance avec des besoins avancés'
                ],
                'features' => [
                    'en' => [
                        'Unlimited users',
                        'Unlimited pets',
                        'Unlimited appointments',
                        'API access',
                        'Custom branding',
                        'Dedicated support',
                        'Advanced analytics',
                        'Data backup',
                        'White label options'
                    ],
                    'ar' => [
                        'مستخدمون غير محدودون',
                        'حيوانات أليفة غير محدودة',
                        'مواعيد غير محدودة',
                        'وصول API',
                        'علامة تجارية مخصصة',
                        'دعم مخصص',
                        'تحليلات متقدمة',
                        'نسخ احتياطي للبيانات',
                        'خيارات العلامة البيضاء'
                    ],
                    'fr' => [
                        'Utilisateurs illimités',
                        'Animaux illimités',
                        'Rendez-vous illimités',
                        'Accès API',
                        'Marque personnalisée',
                        'Support dédié',
                        'Analyses avancées',
                        'Sauvegarde de données',
                        'Options de marque blanche'
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

            // Create role for this subscription plan
            $roleName = "subscription_{$plan->slug}";
            $role = Role::firstOrCreate([
                'name' => $roleName,
                'guard_name' => 'web'
            ]);

            // Get permission objects
            $permissionObjects = Permission::whereIn('name', $permissions)->get();
            
            // Sync permissions to role
            $role->syncPermissions($permissionObjects);

            $this->command->info("Created plan '{$plan->slug}' with role '{$roleName}' and " . count($permissions) . " permissions");
        }
    }
}
