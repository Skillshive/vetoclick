<?php

namespace App\Http\Controllers;

use App\Models\Allergy;
use App\Models\Pet;
use App\Models\MedicalRecord;
use App\Models\Consultation;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Exception;

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
                'medical_record_id' => 'nullable|integer|exists:medical_records,id',
                'allergen_type' => 'required|string',
                'allergen_detail' => 'nullable|string',
                'start_date' => 'nullable|date',
                'reaction_description' => 'nullable|string',
                'severity_level' => 'nullable|in:Mild,Moderate,Severe,Life-threatening',
                'resolved_status' => 'nullable|boolean',
                'resolution_date' => 'nullable|date',
                'treatment_given' => 'nullable|string',
            ]);

            $pet = Pet::where('uuid', $validated['pet_uuid'])->firstOrFail();

            // Create medical record if not provided
            if (!isset($validated['medical_record_id'])) {
                // Create a consultation first
                $consultation = Consultation::create([
                    'pet_id' => $pet->id,
                    'client_id' => $pet->client_id,
                    'veterinary_id' => auth()->id(),
                    'conseil_date' => now(),
                    'conseil_notes' => 'Allergy record',
                ]);

                $medicalRecord = MedicalRecord::create([
                    'consultation_id' => $consultation->id,
                    'record_date' => now(),
                ]);
                $validated['medical_record_id'] = $medicalRecord->id;
            }

            unset($validated['pet_uuid']);
            $allergy = Allergy::create($validated);

            return response()->json([
                'success' => true,
                'message' => 'Allergy created successfully',
                'allergy' => $allergy
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Failed to create allergy',
                'message' => $e->getMessage()
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
                'message' => 'Allergy updated successfully',
                'allergy' => $allergy
            ]);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Failed to update allergy',
                'message' => $e->getMessage()
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
                'message' => 'Allergy deleted successfully'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Failed to delete allergy',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}

