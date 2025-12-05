<?php

namespace App\Http\Controllers;

use App\Models\Vaccination;
use App\Models\Pet;
use App\Models\Consultation;
use App\Models\Veterinary;
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
                'consultation_id' => 'nullable|integer|exists:consultations,id',
                'vaccine_id' => 'required|integer',
                'vaccination_date' => 'required|date',
                'next_due_date' => 'nullable|date',
            ]);

            $pet = Pet::where('uuid', $validated['pet_uuid'])->firstOrFail();

            // If no consultation_id provided, we need consultation to be nullable
            // The consultation_id will be passed from the appointment if it has been converted to consultation
            
            // Set administered_by to current user's ID (foreign key to users table)
            $user = Auth::user();
            if (!$user) {
                return response()->json([
                    'error' => 'User not authenticated',
                    'message' => 'You must be logged in to administer vaccinations'
                ], 401);
            }
            
            $validated['administered_by'] = $user->id;

            // Remove pet_uuid from validated data as it's not a column
            unset($validated['pet_uuid']);

            \Log::info('Creating vaccination:', [
                'data' => $validated,
                'pet_id' => $pet->id,
                'consultation_id' => $validated['consultation_id'] ?? 'null'
            ]);

            $vaccination = Vaccination::create($validated);

            \Log::info('Vaccination created:', [
                'id' => $vaccination->id,
                'uuid' => $vaccination->uuid,
                'consultation_id' => $vaccination->consultation_id
            ]);

            // Load relationships - vaccine from products table
            $vaccine = \App\Models\Product::find($validated['vaccine_id']);
            $administeredByUser = \App\Models\User::find($validated['administered_by']);

            return response()->json([
                'success' => true,
                'message' => 'Vaccination created successfully',
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
                'error' => 'Failed to create vaccination',
                'message' => $e->getMessage()
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
                'message' => 'Vaccination updated successfully',
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
                'error' => 'Failed to update vaccination',
                'message' => $e->getMessage()
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
                'message' => 'Vaccination deleted successfully'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Failed to delete vaccination',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}

