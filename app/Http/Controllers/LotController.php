<?php

namespace App\Http\Controllers;

use App\Models\Lot;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Exception;

class LotController extends Controller
{
    /**
     * Update lot
     */
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $lot = Lot::find($id);

            if (!$lot) {
                return response()->json(['error' => 'Lot not found'], 404);
            }

            $validated = $request->validate([
                'expiry_date' => 'nullable|date',
                'selling_price' => 'nullable|numeric|min:0',
                'current_quantity' => [
                    'nullable',
                    'integer',
                    'min:0',
                    function ($attribute, $value, $fail) use ($lot) {
                        if ($value !== null && $value > $lot->initial_quantity) {
                            $fail(__('common.current_quantity_cannot_exceed_initial'));
                        }
                    },
                ],
            ], [
                'current_quantity.max' => __('common.current_quantity_cannot_exceed_initial'),
            ]);

            $lot->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Lot updated successfully',
                'lot' => [
                    'id' => $lot->id,
                    'uuid' => $lot->uuid,
                    'reference' => $lot->reference,
                    'status' => $lot->status,
                    'initial_quantity' => $lot->initial_quantity,
                    'current_quantity' => $lot->current_quantity,
                    'selling_price' => $lot->selling_price,
                    'expiry_date' => $lot->expiry_date,
                    'created_at' => $lot->created_at,
                ]
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'error' => 'Validation failed',
                'message' => $e->getMessage(),
                'errors' => $e->errors()
            ], 422);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Failed to update lot',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}

