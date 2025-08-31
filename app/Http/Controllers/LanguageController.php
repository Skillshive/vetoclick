<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Redirect;

class LanguageController extends Controller
{
    /**
     * Switch the application language
     */
    public function switch(Request $request, $locale)
    {
        $supportedLocales = ['en', 'ar', 'fr'];
        
        if (in_array($locale, $supportedLocales)) {
            Session::put('locale', $locale);
        }
        
        return Redirect::back();
    }

    /**
     * Get available languages
     */
    public function getLanguages()
    {
        return response()->json([
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
        ]);
    }
}