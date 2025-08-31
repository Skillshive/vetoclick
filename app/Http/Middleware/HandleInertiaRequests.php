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
                'user' => $request->user(),
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
}
