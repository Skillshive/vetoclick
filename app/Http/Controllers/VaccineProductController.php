<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Enums\ProductType;
use Illuminate\Http\JsonResponse;
use Exception;
use Illuminate\Support\Facades\Auth;

class VaccineProductController extends Controller
{
    /**
     * Get all vaccine products
     */
    public function index(): JsonResponse
    {
        try {
            $vaccines = Product::where('veterinarian_id', Auth::user()->veterinary->id)
                ->where('type', ProductType::VACCINE->value)
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
                'error' => __('common.failed_to_load_vaccines_products'),
                'message' => __('common.error')
            ], 500);
        }
    }
}

