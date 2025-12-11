<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Authenticated Session Controller
 * 
 * NOTE: Login/sign-in does NOT require OTP verification.
 * OTP is ONLY used for user registration (sign-up).
 */
class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     * NOTE: This method does NOT require OTP verification.
     */
    public function store(LoginRequest $request): RedirectResponse|JsonResponse
    {
        try {
            $request->authenticate();
            
            $user = Auth::user();

            if ($request->wantsJson() || $request->expectsJson()) {
                // For API/JSON requests from frontend, use token-based auth
                // Generate a temporary login token
                $loginToken = \Illuminate\Support\Str::random(60);
                \Illuminate\Support\Facades\Cache::put('login_token_' . $loginToken, $user->id, now()->addMinutes(5));
                
                $redirectUrl = url('/dashboard?login_token=' . $loginToken);
                
                return response()->json([
                    'success' => true,
                    'message' =>__('common.login_successful'),
                    'redirect_url' => $redirectUrl
                ]);
            }

            // For regular web requests, use session
            $request->session()->regenerate();
            return redirect()->intended(route('dashboard', absolute: false));
        } catch (\Illuminate\Validation\ValidationException $e) {
            if ($request->wantsJson() || $request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => __('common.invalid_credentials'),
                    'errors' => $e->errors()
                ], 422);
            }
            throw $e;
        }
    }

    /**
     * Check authentication status (for frontend)
     */
    public function check(Request $request): JsonResponse
    {
        $user = Auth::user();
        // Debug logging (remove in production)
        \Illuminate\Support\Facades\Log::info('Auth check', [
            'has_session' => $request->hasSession(),
            'session_id' => $request->hasSession() ? $request->session()->getId() : null,
            'user_id' => $user ? $user->id : null,
            'cookies_received' => array_keys($request->cookies->all()),
            'session_cookie_name' => config('session.cookie'),
            'session_cookie_received' => $request->cookie(config('session.cookie')),
        ]);
        
        $response = response()->json([
            'authenticated' => $user !== null,
            'user' => $user ? [
                'id' => $user->id,
                'email' => $user->email,
                'name' => ($user->firstname ?? '') . ' ' . ($user->lastname ?? ''),
            ] : null,
        ]);
        
        // If user is authenticated but session cookie wasn't received, 
        // explicitly set it with correct attributes for cross-origin
        if ($user && $request->hasSession()) {
            $sessionName = config('session.cookie');
            $sessionId = $request->session()->getId();
            
            // Set cookie with SameSite=None for cross-origin support
            $response->cookie(
                $sessionName,
                $sessionId,
                config('session.lifetime'),
                config('session.path'),
                config('session.domain'),
                false, // secure = false for localhost HTTP
                true,  // httpOnly = true
                false, // raw = false
                'none' // sameSite = 'none' for cross-origin
            );
        }
        
        return $response;
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
