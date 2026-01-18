<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Services\ImageService;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function __construct(
        private ImageService $imageService,
       
    ) {
    }

    /**
     * Display the user's profile.
     */
    public function show(Request $request): Response
    {
        $user = $request->user()->load(['image', 'veterinary', 'roles']);

        // Check if user has veterinarian role
        $isVeterinarian = $user->hasRole('veterinarian');
        $veterinaryInfo = null;
        
        if ($isVeterinarian && $user->veterinary) {
            $veterinaryInfo = $user->veterinary;
        }

        return Inertia::render('Settings/General', [
            'user' => $user,
            'isVeterinarian' => $isVeterinarian,
            'veterinaryInfo' => $veterinaryInfo,
            'phoneVerified' => $user->phone_verified_at !== null,
        ]);
    }

    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        // Handle image upload
        if ($request->hasFile('image')) {
            try {
                // Delete old image if exists
                if ($user->image) {
                    $this->imageService->getDisk()->delete($user->image);
                }

                $image = $this->imageService->saveImage($request->file('image'), 'profile-images/');
                if ($image) {
                    $validated['image_id'] = $image->id;
                }
            } catch (\Exception $e) {
                Log::error('Image upload failed: ' . $e->getMessage());
                return back()->withErrors(['image' => 'Image upload failed.']);
            }
        }

        // Separate user fields from veterinary fields and client fields
        $userFields = ['firstname', 'lastname', 'email', 'phone', 'image_id'];
        $veterinaryFields = ['license_number', 'specialization', 'years_experience', 'clinic_name', 'address', 'consultation_price', 'city'];
        $clientFields = ['address', 'city', 'postal_code'];
        
        $userData = array_intersect_key($validated, array_flip($userFields));
        $veterinaryData = array_intersect_key($validated, array_flip($veterinaryFields));
        $clientData = array_intersect_key($validated, array_flip($clientFields));

        // Check if phone is being changed
        $phoneChanged = false;
        if (isset($userData['phone']) && $userData['phone'] !== $user->phone) {
            $phoneChanged = true;
            // Normalize phone number for comparison
            $newPhone = $userData['phone'];
            if (strpos($newPhone, '0') === 0) {
                $newPhone = '+212' . substr($newPhone, 1);
            } elseif (strpos($newPhone, '+212') !== 0) {
                $newPhone = '+212' . $newPhone;
            }
            
            $userData['phone'] = $newPhone;
        }

        // Update user data
        $user->fill($userData);

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        if ($phoneChanged) {
            $user->phone_verified_at = null;
        }

        $user->save();

        // Update client record if it exists (sync user data to client)
        $client = $user->client;
        if ($client) {
            $clientUpdateData = [
                'first_name' => $user->firstname,
                'last_name' => $user->lastname,
                'email' => $user->email,
                'phone' => $user->phone,
            ];
            
            // Add client-specific fields if provided
            if (!empty($clientData)) {
                $clientUpdateData = array_merge($clientUpdateData, $clientData);
            }
            
            $client->update($clientUpdateData);
        }

        // Update veterinary information if user has veterinarian role
        if ($user->hasRole('veterinarian') && !empty($veterinaryData)) {
            $veterinary = $user->veterinary;
            if ($veterinary) {
                $veterinary->update($veterinaryData);
            } else {
                // Create veterinary record if it doesn't exist
                $user->veterinary()->create($veterinaryData);
            }
        }

        return Redirect::route('profile.show')->with('success', __('common.profile_updated_successfully'));
    }

    /**
     * Update the user's password.
     */
    public function updatePassword(Request $request): RedirectResponse
    {
        $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'min:8', 'confirmed'],
        ]);

        $request->user()->update([
            'password' => Hash::make($request->password),
        ]);

        return redirect()->back()->with('success', __('common.password_updated_successfully'));
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
