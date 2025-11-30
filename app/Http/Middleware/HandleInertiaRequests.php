<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
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
        return [
            ...parent::share($request),
            'auth' => [
                 'user' => fn () => $request->user()
                ? $this->formatUserData($request->user())
                : null,
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
                
                // Load common translations
                if (file_exists(resource_path("lang/{$locale}/common.php"))) {
                    $translations['common'] = include resource_path("lang/{$locale}/common.php");
                }
                
                // Load validation translations
                if (file_exists(resource_path("lang/{$locale}/validation.php"))) {
                    $translations['validation'] = include resource_path("lang/{$locale}/validation.php");
                }
                
                return $translations;
            },
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
        $user->load(['image', 'veterinary']);
        
        $userData = $user->toArray();
        
        // Format veterinary data: remove id, ensure uuid exists
        if ($user->veterinary) {
            $veterinary = $user->veterinary->toArray();
            
            // Remove id from veterinary data
            unset($veterinary['id']);
            
            // Ensure UUID exists (generate if missing for existing records)
            if (empty($veterinary['uuid'])) {
                $user->veterinary->uuid = \Illuminate\Support\Str::uuid();
                $user->veterinary->save();
                $veterinary['uuid'] = $user->veterinary->uuid;
            }
            
            $userData['veterinary'] = $veterinary;
        }
        
        return $userData;
    }
}
