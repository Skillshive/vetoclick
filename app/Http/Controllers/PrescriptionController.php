<?php

namespace App\Http\Controllers;

use App\Models\Prescription;
use App\Models\Pet;
use App\Models\Product;
use App\Models\Veterinary;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class PrescriptionController extends Controller
{
    /**
     * Store a new prescription
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'pet_uuid' => 'required|string',
                'consultation_id' => 'nullable|string',
                'product_id' => 'nullable|string|exists:products,uuid',
                'medication' => 'required|string|max:255',
                'dosage' => 'required|string|max:255',
                'frequency' => 'required|string|max:255',
                'duration' => 'required|integer|min:1',
                'instructions' => 'nullable|string',
            ]);

            $pet = Pet::where('uuid', $validated['pet_uuid'])->firstOrFail();

            // Convert consultation UUID to ID if provided
            $consultationId = null;
            if (!empty($validated['consultation_id'])) {
                $consultation = \App\Models\Consultation::where('uuid', $validated['consultation_id'])->first();
                if ($consultation) {
                    $consultationId = $consultation->getKey();
                }
            }

            // Get product if product_id is provided
            $product = null;
            $productId = null;
            if (!empty($validated['product_id'])) {
                $product = Product::where('uuid', $validated['product_id'])->first();
                if (!$product) {
                    return response()->json([
                        'success' => false,
                        'error' => 'Product not found',
                        'message' => 'The selected product does not exist'
                    ], 404);
                }
                $productId = $product->getKey();
                // Use product name as medication if not already set
                if (empty($validated['medication'])) {
                    $validated['medication'] = $product->name;
                }
            }

            // Get current user's veterinarian record
            $user = Auth::user();
            if (!$user) {
                return response()->json([
                    'error' => 'User not authenticated',
                    'message' => 'You must be logged in to create prescriptions'
                ], 401);
            }

            // Get veterinarian_id from user
            $veterinarian = Veterinary::where('user_id', $user->getKey())->first();
            if (!$veterinarian) {
                return response()->json([
                    'error' => 'Veterinarian profile not found',
                    'message' => 'You must have a veterinarian profile to create prescriptions'
                ], 403);
            }

            // Remove pet_uuid from validated data as it's not a column
            unset($validated['pet_uuid']);

            $prescription = Prescription::create([
                'pet_id' => $pet->getKey(),
                'veterinarian_id' => $veterinarian->getKey(),
                'consultation_id' => $consultationId,
                'product_id' => $productId,
                'medication' => $validated['medication'],
                'dosage' => $validated['dosage'],
                'frequency' => $validated['frequency'],
                'duration' => $validated['duration'],
            ]);

            // Load relationships for response
            $prescription->load(['product', 'veterinarian.user']);

            return response()->json([
                'success' => true,
                'message' => 'Prescription created successfully',
                'prescription' => [
                    'uuid' => $prescription->uuid,
                    'medication' => $prescription->medication,
                    'product' => $prescription->product ? [
                        'name' => $prescription->product->name,
                        'id' => $prescription->product->getKey(),
                    ] : null,
                    'dosage' => $prescription->dosage,
                    'frequency' => $prescription->frequency,
                    'duration' => $prescription->duration,
                    'instructions' => $prescription->instructions,
                    'prescribed_date' => $prescription->prescribed_date?->format('Y-m-d'),
                ]
            ], 201);
        } catch (Exception $e) {
            Log::error('Failed to create prescription: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to create prescription',
                'message' => $e->getMessage()
            ], 500);
        }
    }




    /**
     * Update prescription
     */
    public function update(Request $request, string $uuid): JsonResponse
    {
        try {
            $prescription = Prescription::where('uuid', $uuid)->firstOrFail();

            $validated = $request->validate([
                'product_id' => 'nullable|integer|exists:products,id',
                'medication' => 'sometimes|string|max:255',
                'dosage' => 'sometimes|string|max:255',
                'frequency' => 'sometimes|string|max:255',
                'duration' => 'sometimes|integer|min:1',
                'instructions' => 'nullable|string',
            ]);

            // If product_id is provided, get medication name from product
            if (!empty($validated['product_id'])) {
                $product = Product::find($validated['product_id']);
                if ($product) {
                    $validated['medication'] = $product->name;
                }
            }

            $prescription->update($validated);
            $prescription->load(['product', 'veterinarian.user']);

            return response()->json([
                'success' => true,
                'message' => 'Prescription updated successfully',
                'prescription' => [
                    'uuid' => $prescription->uuid,
                    'medication' => $prescription->medication,
                    'product' => $prescription->product ? [
                        'name' => $prescription->product->name,
                        'id' => $prescription->product->getKey(),
                    ] : null,
                    'dosage' => $prescription->dosage,
                    'frequency' => $prescription->frequency,
                    'duration' => $prescription->duration,
                    'instructions' => $prescription->instructions,
                    'prescribed_date' => $prescription->prescribed_date?->format('Y-m-d'),
                ]
            ]);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Failed to update prescription',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete prescription
     */
    public function destroy(string $uuid): JsonResponse
    {
        try {
            $prescription = Prescription::where('uuid', $uuid)->firstOrFail();
            $prescription->delete();

            return response()->json([
                'success' => true,
                'message' => 'Prescription deleted successfully'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Failed to delete prescription',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
