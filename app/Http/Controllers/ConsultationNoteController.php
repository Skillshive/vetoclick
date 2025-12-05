<?php

namespace App\Http\Controllers;

use App\Models\Consultation;
use App\Models\Pet;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Exception;

class ConsultationNoteController extends Controller
{
    /**
     * Store a new consultation note
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'pet_uuid' => 'required|string',
                'conseil_date' => 'required|date',
                'conseil_notes' => 'required|string',
                'visit_type' => 'nullable|string',
            ]);

            $pet = Pet::where('uuid', $validated['pet_uuid'])->firstOrFail();

            $consultation = Consultation::create([
                'pet_id' => $pet->id,
                'client_id' => $pet->client_id,
                'veterinary_id' => auth()->id(),
                'conseil_date' => $validated['conseil_date'],
                'conseil_notes' => $validated['conseil_notes'],
            ]);

            $consultation->load('veterinary');

            return response()->json([
                'success' => true,
                'message' => 'Note created successfully',
                'note' => [
                    'uuid' => $consultation->uuid,
                    'date' => $consultation->conseil_date,
                    'veterinarian' => $consultation->veterinary ?
                        $consultation->veterinary->first_name . ' ' . $consultation->veterinary->last_name :
                        'Unknown',
                    'notes' => $consultation->conseil_notes,
                    'visit_type' => $validated['visit_type'] ?? 'Consultation',
                ]
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Failed to create note',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update consultation note
     */
    public function update(Request $request, string $uuid): JsonResponse
    {
        try {
            $consultation = Consultation::where('uuid', $uuid)->firstOrFail();

            $validated = $request->validate([
                'conseil_date' => 'sometimes|date',
                'conseil_notes' => 'sometimes|string',
                'visit_type' => 'nullable|string',
            ]);

            $consultation->update([
                'conseil_date' => $validated['conseil_date'] ?? $consultation->conseil_date,
                'conseil_notes' => $validated['conseil_notes'] ?? $consultation->conseil_notes,
            ]);

            $consultation->load('veterinary');

            return response()->json([
                'success' => true,
                'message' => 'Note updated successfully',
                'note' => [
                    'uuid' => $consultation->uuid,
                    'date' => $consultation->conseil_date,
                    'veterinarian' => $consultation->veterinary ?
                        $consultation->veterinary->first_name . ' ' . $consultation->veterinary->last_name :
                        'Unknown',
                    'notes' => $consultation->conseil_notes,
                    'visit_type' => $validated['visit_type'] ?? 'Consultation',
                ]
            ]);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Failed to update note',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete consultation note
     */
    public function destroy(string $uuid): JsonResponse
    {
        try {
            $consultation = Consultation::where('uuid', $uuid)->firstOrFail();
            $consultation->delete();

            return response()->json([
                'success' => true,
                'message' => 'Note deleted successfully'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Failed to delete note',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}

