<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    /**
     * Check authentication status (for Next.js frontend)
     * Returns user information if authenticated, or authenticated: false if not
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function checkAuth(Request $request): JsonResponse
    {
        $allCookies = $request->cookies->all();
        $sessionCookieName = config('session.cookie');
        $sessionCookie = $request->cookie($sessionCookieName);
        $hasSession = $request->hasSession();
        $sessionId = $hasSession ? $request->session()->getId() : null;
        
        $allSessionData = $hasSession ? $request->session()->all() : [];
        
        $user = Auth::user();
        
        if (!$user && $hasSession) {
            $guardName = Auth::getDefaultDriver();
            
            $possibleKeys = [
                'login_' . $guardName . '_' . sha1('Illuminate\Auth\SessionGuard'),
                'login_' . $guardName . '_' . sha1('Illuminate\Auth\Guard'),
                'login_web_' . sha1('Illuminate\Auth\SessionGuard'),
                'login_web_' . sha1('Illuminate\Auth\Guard'),
            ];
            
            foreach ($allSessionData as $key => $value) {
                if (strpos($key, 'login_') === 0 && is_numeric($value)) {
                    $possibleKeys[] = $key;
                }
            }
            
            foreach (array_unique($possibleKeys) as $key) {
                $userId = $request->session()->get($key);
                if ($userId && is_numeric($userId)) {
                    $user = User::find($userId);
                    if ($user) {
                        break;
                    }
                }
            }
        }
        
        $sessionKeys = $hasSession ? array_keys($allSessionData) : [];
        $loginKeys = array_filter($sessionKeys, function($key) {
            return strpos($key, 'login_') === 0;
        });
        
        Log::info('API User Check', [
            'user_exists' => $user !== null,
            'user_id' => $user?->id,
            'has_session' => $hasSession,
            'session_id' => $sessionId,
            'session_cookie_present' => $sessionCookie !== null,
            'session_cookie_name' => $sessionCookieName,
            'all_cookies_count' => count($allCookies),
            'cookie_names' => array_keys($allCookies),
            'all_session_keys' => $sessionKeys,
            'login_keys_found' => array_values($loginKeys),
            'session_data_sample' => $hasSession ? array_slice($allSessionData, 0, 5, true) : [],
            'auth_guard' => Auth::getDefaultDriver(),
            'auth_check' => Auth::check(),
            'origin' => $request->headers->get('Origin'),
            'referer' => $request->headers->get('Referer'),
        ]);
        
        if ($user) {
            return response()->json([
                'authenticated' => true,
                'user' => [
                    'id' => $user->id,
                    'email' => $user->email,
                    'firstname' => $user->firstname,
                    'lastname' => $user->lastname,
                ]
            ])->header('Access-Control-Allow-Credentials', 'true')
              ->header('Access-Control-Allow-Origin', $request->headers->get('Origin') ?? '*');
        }
        
        return response()->json([
            'authenticated' => false
        ], 200)->header('Access-Control-Allow-Credentials', 'true')
          ->header('Access-Control-Allow-Origin', $request->headers->get('Origin') ?? '*');
    }
}

