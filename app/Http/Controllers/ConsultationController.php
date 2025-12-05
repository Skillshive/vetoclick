<?php

namespace App\Http\Controllers;

use App\Models\Consultation;
use App\Enums\ConsultationStatus;
use Illuminate\Http\JsonResponse;
use Exception;

class ConsultationController extends Controller
{
    /**
     * Close/Complete a consultation
     */
    public function close(string $uuid): JsonResponse
    {
        try {
            $consultation = Consultation::where('uuid', $uuid)->firstOrFail();

            // Update consultation status to completed
            $consultation->update([
                'status' => ConsultationStatus::COMPLETED->value,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Consultation closed successfully',
            ]);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Failed to close consultation',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}

