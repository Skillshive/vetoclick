<?php

namespace App\Http\Controllers;

use App\Models\Vaccination;
use App\Models\Pet;
use App\Models\Consultation;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Exception;
use Illuminate\Support\Facades\Auth;

class VaccinationController extends Controller
{
    /**
     * Store a new vaccination
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'pet_uuid' => 'required|string',
                'consultation_id' => 'nullable|string|exists:consultations,uuid',
                'vaccine_id' => 'required|integer',
                'vaccination_date' => 'required|date',
                'next_due_date' => 'nullable|date',
            ]);

            $pet = Pet::where('uuid', $validated['pet_uuid'])->firstOrFail();
            $consultation = Consultation::where('uuid', $validated['consultation_id'])->firstOrFail();

            $user = Auth::user();
            if (!$user) {
                return response()->json([
                    'error' => __('common.user_not_authenticated'),
                    'message' => __('common.you_must_be_logged_in_to_administer_vaccinations')
                ], 401);
            }
            
            $validated['administered_by'] = $user->id;

            // Remove pet_uuid from validated data as it's not a column
            unset($validated['pet_uuid']);

            $vaccination = Vaccination::create([
                'consultation_id' => $consultation->id,
                'administered_by' => $user->id,
                'vaccine_id' => $validated['vaccine_id'],
                'vaccination_date' => $validated['vaccination_date'],
                'next_due_date' => $validated['next_due_date'],
            ]);

            // Load relationships - vaccine from products table
            $vaccine = Product::find($validated['vaccine_id']);
            $administeredByUser = User::find($validated['administered_by']);

            return response()->json([
                'success' => true,
                'message' => __('common.vaccination_created_successfully'),
                'vaccination' => [
                    'uuid' => $vaccination->uuid,
                    'vaccine_name' => $vaccine ? $vaccine->name : 'Unknown',
                    'vaccination_date' => $vaccination->vaccination_date,
                    'next_due_date' => $vaccination->next_due_date,
                    'status' => $vaccination->next_due_date && now()->gt($vaccination->next_due_date) ? 'overdue' : 'active',
                    'administered_by' => $administeredByUser ? ($administeredByUser->firstname . ' ' . $administeredByUser->lastname) : 'Unknown',
                ]
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'error' => __('common.failed_to_create_vaccination'),
                'message' => __('common.error')
            ], 500);
        }
    }

    /**
     * Update vaccination
     */
    public function update(Request $request, string $uuid): JsonResponse
    {
        try {
            $vaccination = Vaccination::where('uuid', $uuid)->firstOrFail();

            $validated = $request->validate([
                'vaccine_id' => 'sometimes|integer|exists:vaccins,id',
                'vaccination_date' => 'sometimes|date',
                'next_due_date' => 'nullable|date',
                'administered_by' => 'nullable|string',
            ]);

            $vaccination->update($validated);
            $vaccination->load('vaccin');

            return response()->json([
                'success' => true,
                'message' => __('common.vaccination_updated_successfully'),
                'vaccination' => [
                    'uuid' => $vaccination->uuid,
                    'vaccine_name' => $vaccination->vaccin ? $vaccination->vaccin->vaccin_name : 'Unknown',
                    'vaccination_date' => $vaccination->vaccination_date,
                    'next_due_date' => $vaccination->next_due_date,
                    'status' => $vaccination->next_due_date && now()->gt($vaccination->next_due_date) ? 'overdue' : 'active',
                    'administered_by' => $vaccination->administered_by,
                ]
            ]);
        } catch (Exception $e) {
            return response()->json([
                'error' => __('common.failed_to_update_vaccination'),
                'message' =>  __('common.error')
            ], 500);
        }
    }

    /**
     * Delete vaccination
     */
    public function destroy(string $uuid): JsonResponse
    {
        try {
            $vaccination = Vaccination::where('uuid', $uuid)->firstOrFail();
            $vaccination->delete();

            return response()->json([
                'success' => true,
                'message' => __('common.vaccination_deleted_successfully')
            ]);
        } catch (Exception $e) {
            return response()->json([
                'error' => __('common.failed_to_delete_vaccination'),
                'message' => __('common.error')
            ], 500);
        }
    }
}

