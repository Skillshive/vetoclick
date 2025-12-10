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
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;

/**
 * OTP Verification Controller
 * 
 * NOTE: OTP verification is ONLY used for user registration (sign-up).
 * Login/sign-in does NOT require OTP verification.
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

        if (!$result['success']) {
          
            return response()->json([
                'success' => false,
                'message' => __('common.otp.failed_to_send'),
                'error' =>  __('common.otp.sms_service_unavailable')
            ], 500);
        }

        // For development, you might want to return the OTP (remove in production)
        return response()->json([
            'success' => true,
            'message' => __('common.otp.sent_successfully'),
            'otp_sent' => true,
            // Remove this in production:
            'otp' => env('APP_DEBUG', false) ? $otp : null,
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
        ]);

        // Fire registered event
        event(new Registered($user));

        // Log the user in automatically
        Auth::login($user);
        
        // Handle session if available (API routes may not have session middleware)
        if ($request->hasSession()) {
            $request->session()->regenerate();
            $request->session()->save();
        } else {
            $loginToken = Str::random(60);
            Cache::put('login_token_' . $loginToken, $user->id, now()->addMinutes(5));
            
            // Append token to redirect URL for authentication
            $redirectUrl = env('APP_URL') . '/dashboard?login_token=' . $loginToken;
        }

        // Clear verification cache
        $verificationKey = 'phone_verified_' . $phone;
        Cache::forget($verificationKey);

        // Return redirect URL to dashboard
        if (!isset($redirectUrl)) {
            $redirectUrl = env('APP_URL') . '/dashboard';
        }

        // Return JSON response
        return response()->json([
            'success' => true,
            'message' => __('common.otp.verified_successfully'),
            'verified' => true,
            'redirect_url' => $redirectUrl,
        ]);
    }
}





