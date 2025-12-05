<?php

namespace App\Http\Controllers;

use App\Models\Note;
use App\Models\Pet;
use App\Models\Veterinary;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class NoteController extends Controller
{
    /**
     * Store a new note
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'pet_uuid' => 'required|string',
                'consultation_id' => 'nullable|string',
                'date' => 'required|date',
                'visit_type' => 'required|string|max:255',
                'notes' => 'required|string',
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
                    'message' => 'You must be logged in to create notes'
                ], 401);
            }

            // Get veterinarian_id from user
            $veterinarian = Veterinary::where('user_id', $user->id)->first();
            if (!$veterinarian) {
                return response()->json([
                    'error' => 'Veterinarian profile not found',
                    'message' => 'You must have a veterinarian profile to create notes'
                ], 403);
            }

            $validated['pet_id'] = $pet->id;
            $validated['veterinarian_id'] = $veterinarian->id;
            $validated['consultation_id'] = $consultationId;

            // Remove pet_uuid from validated data as it's not a column
            unset($validated['pet_uuid']);

            $note = Note::create($validated);

            // Load relationships for response
            $note->load('veterinarian.user');

            return response()->json([
                'success' => true,
                'message' => 'Note created successfully',
                'note' => [
                    'uuid' => $note->uuid,
                    'date' => $note->date->format('Y-m-d'),
                    'visit_type' => $note->visit_type,
                    'notes' => $note->notes,
                    'veterinarian' => $note->veterinarian && $note->veterinarian->user 
                        ? $note->veterinarian->user->firstname . ' ' . $note->veterinarian->user->lastname
                        : 'Unknown',
                ]
            ], 201);
        } catch (Exception $e) {
            Log::error('Failed to create note: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to create note',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update note
     */
    public function update(Request $request, string $uuid): JsonResponse
    {
        try {
            $note = Note::where('uuid', $uuid)->firstOrFail();

            $validated = $request->validate([
                'date' => 'sometimes|date',
                'visit_type' => 'sometimes|string|max:255',
                'notes' => 'sometimes|string',
            ]);

            $note->update($validated);
            $note->load('veterinarian.user');

            return response()->json([
                'success' => true,
                'message' => 'Note updated successfully',
                'note' => [
                    'uuid' => $note->uuid,
                    'date' => $note->date->format('Y-m-d'),
                    'visit_type' => $note->visit_type,
                    'notes' => $note->notes,
                    'veterinarian' => $note->veterinarian && $note->veterinarian->user 
                        ? $note->veterinarian->user->firstname . ' ' . $note->veterinarian->user->lastname
                        : 'Unknown',
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
     * Delete note
     */
    public function destroy(string $uuid): JsonResponse
    {
        try {
            $note = Note::where('uuid', $uuid)->firstOrFail();
            $note->delete();

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

