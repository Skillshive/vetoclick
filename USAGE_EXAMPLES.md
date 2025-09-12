# 🎯 **Flexible Subscription + Spatie Permissions System**

## **How to Use the System**

### **1. Backend Usage**

#### **In Controllers:**
```php
<?php

namespace App\Http\Controllers;

use App\Traits\HandlesSubscriptionPermissions;
use Illuminate\Http\Request;

class PetController extends Controller
{
    use HandlesSubscriptionPermissions;

    public function store(Request $request)
    {
        // Check both permission AND subscription limit
        $this->abortIfCannotPerformWithPermission(
            'create_pet', 
            'pets.create',
            ['clinic_id' => auth()->user()->clinic_id]
        );

        // Proceed with pet creation
        // ...
    }

    public function index(Request $request)
    {
        // Get subscription status for frontend
        $subscriptionStatus = $this->getSubscriptionStatus();
        $featureStatus = $this->getFeatureStatus();
        
        return Inertia::render('Pets/Index', [
            'pets' => $pets,
            'subscription' => $subscriptionStatus,
            'features' => $featureStatus,
        ]);
    }
}
```

#### **In Routes:**
```php
// Using middleware
Route::middleware(['auth', 'subscription.permission:create_user,users.create'])
    ->post('/users', [UserController::class, 'store']);

Route::middleware(['auth', 'subscription.feature:export_data'])
    ->get('/export', [ExportController::class, 'index']);
```

#### **In Blade Templates:**
```php
@if(auth()->user()->can('users.create') && app('App\Services\FeatureGateService')->can(auth()->user(), 'create_user'))
    <button>Create User</button>
@else
    <div class="subscription-limit">
        User limit reached. Upgrade your plan.
    </div>
@endif
```

### **2. Frontend Usage**

#### **Using the Hook:**
```tsx
import { useSubscriptionFeatures, SubscriptionGate } from '@/hooks/useSubscriptionFeatures';

function PetForm() {
  const { canPerform, isLimitReached, getUpgradeMessage } = useSubscriptionFeatures();

  const handleSubmit = () => {
    if (!canPerform('create_pet')) {
      alert(getUpgradeMessage('create_pet'));
      return;
    }
    
    // Submit form
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      
      <SubscriptionGate action="create_pet">
        <button type="submit">Create Pet</button>
      </SubscriptionGate>
    </form>
  );
}
```

#### **Using Components:**
```tsx
import { SubscriptionGate, PermissionGate, LimitIndicator } from '@/components/SubscriptionGate';

function Dashboard() {
  return (
    <div>
      {/* Show limit indicators */}
      <LimitIndicator resource="users" />
      <LimitIndicator resource="pets" />
      <LimitIndicator resource="appointments" />

      {/* Gate features based on subscription */}
      <SubscriptionGate action="export_data">
        <button>Export Data</button>
      </SubscriptionGate>

      {/* Gate features based on permissions */}
      <PermissionGate permission="advanced_analytics">
        <AdvancedAnalytics />
      </PermissionGate>
    </div>
  );
}
```

### **3. Database Structure**

#### **Subscription Plans Table:**
```sql
CREATE TABLE subscription_plans (
    id BIGINT PRIMARY KEY,
    uuid VARCHAR(36) UNIQUE,
    slug VARCHAR(255) UNIQUE,
    name JSON, -- Multi-language names
    description JSON, -- Multi-language descriptions
    features JSON, -- Multi-language features
    price DECIMAL(10,2),
    currency VARCHAR(3),
    billing_period VARCHAR(50),
    max_users INT NULL,
    max_pets INT NULL,
    max_appointments INT NULL,
    is_active BOOLEAN,
    is_popular BOOLEAN,
    sort_order INT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

#### **Permissions (Spatie):**
```sql
-- Automatically created by Spatie
permissions: id, name, guard_name, created_at, updated_at
roles: id, name, guard_name, created_at, updated_at
model_has_permissions: permission_id, model_type, model_id
model_has_roles: role_id, model_type, model_id
role_has_permissions: permission_id, role_id
```

### **4. Running the System**

#### **Run Migration:**
```bash
php artisan migrate
```

#### **Seed Subscription Plans:**
```bash
php artisan db:seed --class=SubscriptionPlanSeeder
```

#### **Assign User to Subscription:**
```php
// In your user registration or subscription logic
$user = User::find(1);
$plan = SubscriptionPlan::where('slug', 'basic')->first();
$role = Role::where('name', 'subscription_basic')->first();

$user->assignRole($role);
```

### **5. Advanced Features**

#### **Dynamic Permission Checking:**
```php
// In FeatureGateService
public function can(User $user, string $action, array $context = []): bool
{
    // 1. Check Spatie permission first
    if (!$this->hasPermission($user, $action)) {
        return false;
    }

    // 2. Check subscription limits
    $subscription = $this->getUserSubscription($user);
    if (!$subscription) {
        return false;
    }

    // 3. Check specific limits
    return $this->checkLimits($subscription, $action, $context);
}
```

#### **Custom Feature Gates:**
```php
// Add custom features to subscription plans
$plan = SubscriptionPlan::find(1);
$plan->features = [
    'en' => [
        'Advanced analytics',
        'Custom reports',
        'API access',
        'White label'
    ]
];
$plan->save();
```

#### **Usage Tracking:**
```php
// Track usage for limits
$usage = [
    'users' => User::where('clinic_id', $clinicId)->count(),
    'pets' => Pet::where('clinic_id', $clinicId)->count(),
    'appointments' => Appointment::where('clinic_id', $clinicId)
        ->whereMonth('created_at', now()->month)
        ->count(),
];
```

### **6. Benefits of This System**

✅ **Flexible**: Easy to add new features and limits
✅ **Multi-language**: Full support for EN/AR/FR
✅ **Permission-based**: Integrates with Spatie permissions
✅ **Subscription-aware**: Checks both permissions and limits
✅ **Frontend-friendly**: React hooks and components
✅ **Scalable**: Easy to add new subscription tiers
✅ **Maintainable**: Clean separation of concerns

### **7. Example Subscription Plans**

| Plan | Users | Pets | Appointments | Features | Price |
|------|-------|------|--------------|----------|-------|
| Free | 5 | 50 | 100 | Basic | $0 |
| Basic | 25 | 500 | 1000 | Advanced | $29.99 |
| Premium | Unlimited | Unlimited | Unlimited | All | $99.99 |

This system gives you complete control over what users can do based on both their role permissions and their subscription plan limits!
