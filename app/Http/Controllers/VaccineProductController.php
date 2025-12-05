<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Enums\ProductType;
use Illuminate\Http\JsonResponse;
use Exception;

class VaccineProductController extends Controller
{
    /**
     * Get all vaccine products
     */
    public function index(): JsonResponse
    {
        try {
            $vaccines = Product::where('type', ProductType::VACCINE->value)
                ->where('is_active', true)
                ->select('id', 'uuid', 'name', 'brand', 'description', 'sku')
                ->orderBy('name')
                ->get()
                ->map(function ($vaccine) {
                    return [
                        'id' => $vaccine->id,
                        'uuid' => $vaccine->uuid,
                        'name' => $vaccine->name,
                        'brand' => $vaccine->brand,
                        'description' => $vaccine->description,
                        'full_name' => $vaccine->brand ? "{$vaccine->name} ({$vaccine->brand})" : $vaccine->name,
                    ];
                });

            return response()->json(['vaccines' => $vaccines]);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Failed to load vaccines',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}

