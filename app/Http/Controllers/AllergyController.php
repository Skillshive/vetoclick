<?php

namespace App\Http\Controllers;

use App\Models\Allergy;
use App\Models\Pet;
use App\Models\Veterinary;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class AllergyController extends Controller
{
    /**
     * Store a new allergy
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'pet_uuid' => 'required|string',
                'consultation_id' => 'nullable|string',
                'allergen_type' => 'required|string',
                'allergen_detail' => 'required|string',
                'start_date' => 'nullable|date',
                'reaction_description' => 'nullable|string',
                'severity_level' => 'required|in:Mild,Moderate,Severe,Life-threatening',
                'resolved_status' => 'nullable|boolean',
                'resolution_date' => 'nullable|date',
                'treatment_given' => 'nullable|string',
            ]);

            $pet = Pet::where('uuid', $validated['pet_uuid'])->firstOrFail();

            // Convert consultation UUID to ID if provided
            $consultationId = null;
            if (!empty($validated['consultation_id'])) {
                $consultation = \App\Models\Consultation::where('uuid', $validated['consultation_id'])->first();
                if ($consultation) {
                    $consultationId = $consultation->id;
                }
            }

            // Get current user's veterinarian record
            $user = Auth::user();
            if (!$user) {
                return response()->json([
                    'error' => 'User not authenticated',
                    'message' => 'You must be logged in to create allergies'
                ], 401);
            }

            // Get veterinarian_id from user
            $veterinarian = Veterinary::where('user_id', $user->id)->first();
            if (!$veterinarian) {
                return response()->json([
                    'error' => 'Veterinarian profile not found',
                    'message' => 'You must have a veterinarian profile to create allergies'
                ], 403);
            }

            $validated['pet_id'] = $pet->id;
            $validated['veterinarian_id'] = $veterinarian->id;
            $validated['consultation_id'] = $consultationId;
            $validated['start_date'] = $validated['start_date'] ?? now()->toDateString();

            // Remove pet_uuid from validated data as it's not a column
            unset($validated['pet_uuid']);

            $allergy = Allergy::create($validated);

            // Load relationships for response
            $allergy->load(['veterinarian.user']);

            return response()->json([
                'success' => true,
                'message' => __('common.allergy_created_successfully'),
                'allergy' => [
                    'uuid' => $allergy->uuid,
                    'allergen_type' => $allergy->allergen_type,
                    'allergen_detail' => $allergy->allergen_detail,
                    'start_date' => $allergy->start_date?->format('Y-m-d'),
                    'reaction_description' => $allergy->reaction_description,
                    'severity_level' => $allergy->severity_level,
                    'resolved_status' => $allergy->resolved_status,
                ]
            ], 201);
        } catch (Exception $e) {
            Log::error('Failed to create allergy: ' .  __('common.error'));
            return response()->json([
                'error' => 'Failed to create allergy',
                'message' =>  __('common.error')
            ], 500);
        }
    }

    /**
     * Update allergy
     */
    public function update(Request $request, string $uuid): JsonResponse
    {
        try {
            $allergy = Allergy::where('uuid', $uuid)->firstOrFail();

            $validated = $request->validate([
                'allergen_type' => 'sometimes|string',
                'allergen_detail' => 'nullable|string',
                'start_date' => 'nullable|date',
                'reaction_description' => 'nullable|string',
                'severity_level' => 'nullable|in:Mild,Moderate,Severe,Life-threatening',
                'resolved_status' => 'nullable|boolean',
                'resolution_date' => 'nullable|date',
                'treatment_given' => 'nullable|string',
            ]);

            $allergy->update($validated);

            return response()->json([
                'success' => true,
                'message' => __('common.allergy_updated_successfully'),
                'allergy' => $allergy
            ]);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Failed to update allergy',
                'message' =>  __('common.error')
            ], 500);
        }
    }

    /**
     * Delete allergy
     */
    public function destroy(string $uuid): JsonResponse
    {
        try {
            $allergy = Allergy::where('uuid', $uuid)->firstOrFail();
            $allergy->delete();

            return response()->json([
                'success' => true,
                'message' => __('common.allergy_deleted_successfully')
            ]);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Failed to delete allergy',
                'message' =>  __('common.error')
            ], 500);
        }
    }
}

