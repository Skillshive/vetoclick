<?php

namespace App\Http\Controllers;

use App\Models\Consultation;
use App\Models\Note;
use App\Models\Pet;
use App\Models\Veterinary;
use Carbon\Carbon;
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
                $consultation = Consultation::where('uuid', $validated['consultation_id'])->first();
                if ($consultation) {
                    $consultationId = $consultation->id;
                }
            }

            // Get current user's veterinarian record
            $user = Auth::user();
            if (!$user) {
                return response()->json([
                    'error' => __('common.user_not_authenticated'),
                    'message' => __('common.you_must_be_logged_in_to_create_notes')
                ], 401);
            }

            // Get veterinarian_id from user
            $veterinarian = Veterinary::where('user_id', $user->id)->first();
            if (!$veterinarian) {
                return response()->json([
                    'error' => __('common.veterinarian_profile_not_found'),
                    'message' => __('common.you_must_have_a_veterinarian_profile_to_create_notes')
                ], 403);
            }

            $validated['pet_id'] = $pet->id;
            $validated['veterinarian_id'] = $veterinarian->id;
            $validated['consultation_id'] = $consultationId;

            // Remove pet_uuid from validated data as it's not a column
            unset($validated['pet_uuid']);

            $note = Note::create([
                'pet_id' => $pet->id,
                'veterinarian_id' => $veterinarian->id,
                'consultation_id' => $consultationId,
                'date' => Carbon::today()->format('Y-m-d'),
                'visit_type' => $validated['visit_type'],
                'notes' => $validated['notes'],
            ]);

            // Load relationships for response
            $note->load('veterinarian.user');

            return response()->json([
                'success' => true,
                'message' => __('common.note_created_successfully'),
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
            Log::error('Failed to create note: ' .  __('common.error'));
            return response()->json([
                'error' => __('common.failed_to_create_note'),
                'message' => __('common.error')
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
                'message' => __('common.note_updated_successfully'),
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
                'error' => __('common.failed_to_update_note'),
                'message' => __('common.error')
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
                'message' => __('common.note_deleted_successfully')
            ]);
        } catch (Exception $e) {
            return response()->json([
                'error' => __('common.failed_to_delete_note'),
                'message' => __('common.error')
            ], 500);
        }
    }
}

