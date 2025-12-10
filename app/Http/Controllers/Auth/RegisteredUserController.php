<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse|JsonResponse
    {
        $request->validate([
            'firstname' => 'nullable|string|max:255',
            'lastname' => 'nullable|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'phone' => ['required', 'string', 'regex:/^(\+212|0)[0-9]{9}$/'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        // Normalize phone number
        $phone = $request->phone;
        if (strpos($phone, '0') === 0) {
            $phone = '+212' . substr($phone, 1);
        } elseif (strpos($phone, '+212') !== 0) {
            $phone = '+212' . $phone;
        }

        // Verify phone number was verified via OTP (required for registration only)
        // NOTE: Login does NOT require OTP verification
        $verificationKey = 'phone_verified_' . $phone;
        if (!Cache::has($verificationKey)) {
            if ($request->wantsJson() || $request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Phone number must be verified before registration.',
                    'error' => 'phone_not_verified'
                ], 422);
            }
            return back()->withErrors(['phone' => 'Phone number must be verified before registration.']);
        }

        $user = User::create([
            'firstname' => $request->firstname ?? null,
            'lastname' => $request->lastname ?? null,
            'email' => $request->email,
            'phone' => $phone,
            'password' => Hash::make($request->password),
        ]);

        // Clear verification cache
        Cache::forget($verificationKey);

        event(new Registered($user));

        Auth::login($user);

        if ($request->wantsJson() || $request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Registration successful.',
                'redirect_url' => route('dashboard', absolute: false)
            ]);
        }

        return redirect(route('dashboard', absolute: false));
    }
}
