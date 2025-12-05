<?php

namespace App\Http\Controllers;

use App\Models\Vaccin;
use Illuminate\Http\JsonResponse;
use Exception;

class VaccinController extends Controller
{
    /**
     * Get all vaccines
     */
    public function index(): JsonResponse
    {
        try {
            $vaccins = Vaccin::all()->map(function ($vaccin) {
                return [
                    'id' => $vaccin->id,
                    'uuid' => $vaccin->uuid,
                    'name' => $vaccin->vaccin_name,
                    'description' => $vaccin->description ?? '',
                ];
            });

            return response()->json(['vaccins' => $vaccins]);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Failed to load vaccines',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}

