<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\TwilioService;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rules;

/**
 * OTP Verification Controller
 * 
 * Handles OTP verification for:
 * - User registration (sign-up)
 * - Phone number updates in profile settings
 */
class OtpVerificationController extends Controller
{
    protected TwilioService $twilioService;

    public function __construct(TwilioService $twilioService)
    {
        $this->twilioService = $twilioService;
    }

    /**
     * Send OTP to phone number (for registration only)
     */
    public function sendOtp(Request $request): JsonResponse
    {
        $request->validate([
            'phone' => ['required', 'string', 'regex:/^(\+212|0)[0-9]{9}$/'],
        ]);

        $phone = $request->phone;
        
        // Normalize phone number (convert 0 to +212)
        if (strpos($phone, '0') === 0) {
            $phone = '+212' . substr($phone, 1);
        } elseif (strpos($phone, '+212') !== 0) {
            $phone = '+212' . $phone;
        }

        // Generate 6-digit OTP
        $otp = str_pad((string) rand(0, 999999), 6, '0', STR_PAD_LEFT);

        // Store OTP in cache for 10 minutes
        $cacheKey = 'otp_' . $phone;
        Cache::put($cacheKey, $otp, now()->addMinutes(10));

        // Send OTP via SMS
        $message = __('common.otp.message', ['otp' => $otp]);
        $result = $this->twilioService->sendSMS($phone, $message);

        // In development mode, if Twilio fails, still allow OTP to be used
        if (!$result['success']) {
            if (app()->environment('local') || env('APP_DEBUG', false)) {
                // Development mode: Log OTP to server logs only (NOT in response for security)
                Log::info('Twilio SMS failed in development mode. OTP logged for testing.', [
                'phone' => $phone,
                    'otp' => $otp,
                'error' => $result['error'] ?? 'Unknown error'
            ]);

                return response()->json([
                    'success' => true,
                    'message' => __('common.otp.sent_successfully') . ' (Development mode - SMS service unavailable. Check server logs for OTP.)',
                    'otp_sent' => true,
                    // SECURITY: Never return OTP in response - check server logs instead
                ]);
            }
          
            // Production mode: Return error
            return response()->json([
                'success' => false,
                'message' => __('common.otp.failed_to_send'),
                'error' => __('common.otp.sms_service_unavailable')
            ], 500);
        }

        // SMS sent successfully - NEVER return OTP in response (security)
        return response()->json([
            'success' => true,
            'message' => __('common.otp.sent_successfully'),
            'otp_sent' => true,
        ]);
    }

    /**
     * Verify OTP and automatically register/login user
     */
    public function verifyOtp(Request $request): JsonResponse
    {
        $request->validate([
            'phone' => ['required', 'string', 'regex:/^(\+212|0)[0-9]{9}$/'],
            'otp' => ['required', 'string', 'size:6'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255'],
            'password' => ['required', 'string', 'confirmed', Rules\Password::defaults()],
        ]);

        $phone = $request->phone;
        
        // Normalize phone number
        if (strpos($phone, '0') === 0) {
            $phone = '+212' . substr($phone, 1);
        } elseif (strpos($phone, '+212') !== 0) {
            $phone = '+212' . $phone;
        }

        $otp = $request->otp;
        $cacheKey = 'otp_' . $phone;
        $storedOtp = Cache::get($cacheKey);

        if (!$storedOtp) {
            return response()->json([
                'success' => false,
                'message' => __('common.otp.expired_or_not_found'),
            ], 400);
        }

        if ($storedOtp !== $otp) {
            // Track failed attempts
            $attemptsKey = 'otp_attempts_' . $phone;
            $attempts = Cache::get($attemptsKey, 0) + 1;
            Cache::put($attemptsKey, $attempts, now()->addMinutes(10));

            if ($attempts >= 5) {
                Cache::forget($cacheKey);
                return response()->json([
                    'success' => false,
                    'message' => __('common.otp.too_many_attempts'),
                ], 429);
            }

            return response()->json([
                'success' => false,
                'message' => __('common.otp.invalid_otp'),
                'attempts_remaining' => 5 - $attempts,
            ], 400);
        }

        // OTP verified successfully
        Cache::forget($cacheKey);
        Cache::forget($attemptsKey ?? 'otp_attempts_' . $phone);

        // Check if user already exists by phone or email (for signup, user should not exist)
        $existingUser = User::where('phone', $phone)
            ->orWhere('email', $request->email)
            ->first();

        if ($existingUser) {
            // User already exists - this is a signup, so return error
            return response()->json([
                'success' => false,
                'message' => __('common.otp.account_already_exists'),
            ], 422);
        }

        // Create new user account (signup)
        $user = User::create([
            'email' => $request->email,
            'phone' => $phone,
            'password' => Hash::make($request->password),
            'email_verified_at' => now(),
            'phone_verified_at' => now(), // Phone is verified via OTP
            'phone_verified' => true,
        ]);

        // Fire registered event
        event(new Registered($user));

        // Log in the user immediately - session is automatically created
        Auth::login($user, true); // true = remember me
        
        // Regenerate session to prevent session fixation attacks
        $request->session()->regenerate();
        
        // Explicitly save the session to ensure it's written
        $request->session()->save();
        
        // Log for debugging
        Log::info('User registered and logged in', [
            'user_id' => $user->id,
            'email' => $user->email,
            'session_id' => $request->session()->getId(),
            'auth_check' => Auth::check(),
            'auth_id' => Auth::id(),
        ]);
        
        // Get session configuration
        $sessionName = config('session.cookie', 'laravel_session');
        $sessionId = $request->session()->getId();
        $sameSite = config('session.same_site', 'lax');
        $secure = config('session.secure', false);
        
        // Fix SameSite=none requires Secure for localhost
        if ($sameSite === 'none' && !$secure) {
            $sameSite = 'lax';
        }
        
        // Create response with explicit session cookie
        return response()->json([
            'success' => true,
            'message' => __('common.otp.verified_successfully'),
            'verified' => true,
            'redirect_url' => route('dashboard'),
        ])->cookie(
            $sessionName,
            $sessionId,
            config('session.lifetime', 120),
            config('session.path', '/'),
            config('session.domain'),
            $secure,
            config('session.http_only', true),
            false,
            $sameSite
        );
    }

    /**
     * Send OTP for phone number update (for existing users)
     */
    public function sendPhoneUpdateOtp(Request $request): JsonResponse
    {
        $request->validate([
            'phone' => ['required', 'string', 'regex:/^(\+212|0)[0-9]{9}$/'],
        ]);

        $user = Auth::user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => __('common.otp.authentication_required'),
            ], 401);
        }

        $phone = $request->phone;
        
        // Normalize phone number (convert 0 to +212)
        if (strpos($phone, '0') === 0) {
            $phone = '+212' . substr($phone, 1);
        } elseif (strpos($phone, '+212') !== 0) {
            $phone = '+212' . $phone;
        }

        // Check if phone is already taken by another user
        $existingUser = User::where('phone', $phone)
            ->where('id', '!=', $user->id)
            ->first();

        if ($existingUser) {
            return response()->json([
                'success' => false,
                'message' => __('common.otp.phone_already_taken'),
            ], 422);
        }

        // Generate 6-digit OTP
        $otp = str_pad((string) rand(0, 999999), 6, '0', STR_PAD_LEFT);

        // Store OTP in cache for 10 minutes with user context
        $cacheKey = 'phone_update_otp_' . $phone . '_' . $user->id;
        Cache::put($cacheKey, $otp, now()->addMinutes(10));

        // Send OTP via SMS
        $message = __('common.otp.message', ['otp' => $otp]);
        $result = $this->twilioService->sendSMS($phone, $message);

        // In development mode, if Twilio fails, still allow OTP to be used
        if (!$result['success']) {
            if (app()->environment('local') || env('APP_DEBUG', false)) {
                Log::info('Twilio SMS failed in development mode. OTP logged for testing.', [
                    'phone' => $phone,
                    'otp' => $otp,
                    'error' => $result['error'] ?? 'Unknown error'
                ]);
                
                return response()->json([
                    'success' => true,
                    'message' => __('common.otp.sent_successfully') . ' (Development mode - SMS service unavailable. Check server logs for OTP.)',
                    'otp_sent' => true,
                ]);
            }
          
            return response()->json([
                'success' => false,
                'message' => __('common.otp.failed_to_send'),
                'error' => __('common.otp.sms_service_unavailable')
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => __('common.otp.sent_successfully'),
            'otp_sent' => true,
        ]);
    }

    /**
     * Verify OTP for phone number update
     */
    public function verifyPhoneUpdateOtp(Request $request): JsonResponse
    {
        $request->validate([
            'phone' => ['required', 'string', 'regex:/^(\+212|0)[0-9]{9}$/'],
            'otp' => ['required', 'string', 'size:6'],
        ]);

        $user = Auth::user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => __('common.otp.authentication_required'),
            ], 401);
        }

        $phone = $request->phone;
        
        // Normalize phone number
        if (strpos($phone, '0') === 0) {
            $phone = '+212' . substr($phone, 1);
        } elseif (strpos($phone, '+212') !== 0) {
            $phone = '+212' . $phone;
        }

        $otp = $request->otp;
        $cacheKey = 'phone_update_otp_' . $phone . '_' . $user->id;
        $storedOtp = Cache::get($cacheKey);

        if (!$storedOtp) {
            return response()->json([
                'success' => false,
                'message' => __('common.otp.expired_or_not_found'),
            ], 400);
        }

        if ($storedOtp !== $otp) {
            // Track failed attempts
            $attemptsKey = 'phone_update_otp_attempts_' . $phone . '_' . $user->id;
            $attempts = Cache::get($attemptsKey, 0) + 1;
            Cache::put($attemptsKey, $attempts, now()->addMinutes(10));

            if ($attempts >= 5) {
                Cache::forget($cacheKey);
                return response()->json([
                    'success' => false,
                    'message' => __('common.otp.too_many_attempts'),
                ], 429);
            }

            return response()->json([
                'success' => false,
                'message' => __('common.otp.invalid_otp'),
                'attempts_remaining' => 5 - $attempts,
            ], 400);
        }

        // OTP verified successfully
        Cache::forget($cacheKey);
        Cache::forget($attemptsKey ?? 'phone_update_otp_attempts_' . $phone . '_' . $user->id);

        // Update user's phone and mark as verified
        $user->phone = $phone;
        $user->phone_verified_at = now();
        $user->save();

        return response()->json([
            'success' => true,
            'message' => __('common.otp.phone_verified_successfully'),
            'verified' => true,
        ]);
    }
}





