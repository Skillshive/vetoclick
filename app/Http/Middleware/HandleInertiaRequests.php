<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        
        return [
            ...parent::share($request),
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
            'auth' => [
                'user' => $user ? $this->formatUserData($user) : null,
            ],
            'locale' => [
                'current' => app()->getLocale(),
                'available' => [
                    'en' => [
                        'code' => 'en',
                        'name' => 'English',
                        'native' => 'English',
                        'rtl' => false
                    ],
                    'ar' => [
                        'code' => 'ar',
                        'name' => 'Arabic',
                        'native' => 'العربية',
                        'rtl' => true
                    ],
                    'fr' => [
                        'code' => 'fr',
                        'name' => 'French',
                        'native' => 'Français',
                        'rtl' => false
                    ]
                ]
            ],
            'translations' => function () {
                $locale = app()->getLocale();
                $translations = [];
                
                if (file_exists(resource_path("lang/{$locale}/common.php"))) {
                    $translations['common'] = include resource_path("lang/{$locale}/common.php");
                }
                
                if (file_exists(resource_path("lang/{$locale}/validation.php"))) {
                    $translations['validation'] = include resource_path("lang/{$locale}/validation.php");
                }
                
                return $translations;
            },
            'pusher' => [
                'key' => config('broadcasting.connections.pusher.key'),
                'cluster' => config('broadcasting.connections.pusher.options.cluster'),
            ],
            'suggestions' => fn () => $request->session()->get('suggestions', []),
        ];
    }

    /**
     * Format user data for Inertia, ensuring veterinary has UUID and no ID
     *
     * @param \App\Models\User $user
     * @return array
     */
    protected function formatUserData($user)
    {
        $user->load(['image', 'veterinary', 'roles.permissions']);
        
        $userData = $user->toArray();
        
        if ($user->roles) {
            $userData['roles'] = $user->roles->map(function ($role) {
                return [
                    'id' => $role->id,
                    'name' => $role->name,
                    'guard_name' => $role->guard_name,
                    'permissions' => $role->permissions->pluck('name')->toArray()
                ];
            })->toArray();
        }
        
        $userData['permissions'] = $user->getAllPermissions()->pluck('name')->toArray();
        
        if ($user->veterinary) {
            $veterinary = $user->veterinary->toArray();
            
            unset($veterinary['id']);
            
            if (empty($veterinary['uuid'])) {
                $user->veterinary->uuid = Str::uuid();
                $user->veterinary->save();
                $veterinary['uuid'] = $user->veterinary->uuid;
            }
            
            $userData['veterinary'] = $veterinary;
        }
        
        return $userData;
    }
}
