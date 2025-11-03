<?php

namespace App\Http\Controllers;

use App\Services\AddressValidationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AddressValidationController extends Controller
{
    protected AddressValidationService $addressValidationService;

    public function __construct(AddressValidationService $addressValidationService)
    {
        $this->addressValidationService = $addressValidationService;
    }

    /**
     * Validate an address using OpenStreetMap Nominatim API
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function validate(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'address' => 'required|string|max:500',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'valid' => false,
                    'error' => 'Invalid input',
                    'message' => 'Address is required and must be a valid string.',
                    'errors' => $validator->errors()
                ], 422);
            }

            $address = $request->input('address');
            
            Log::info('Address validation request', ['address' => $address]);
            
            $result = $this->addressValidationService->validateAddress($address);
            
            Log::info('Address validation result', ['result' => $result]);

            // Return JSON for API requests, Inertia response for web requests
            if ($request->expectsJson()) {
                return response()->json($result);
            }

            // For Inertia requests, return the validation result as props
            return response()->json($result);
            
        } catch (\Exception $e) {
            Log::error('Address validation controller error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            $errorResult = [
                'valid' => false,
                'error' => 'Server error',
                'message' => 'Address validation service is temporarily unavailable. Please try again later.'
            ];

            if ($request->expectsJson()) {
                return response()->json($errorResult, 500);
            }

            return back()->with('validationResult', $errorResult);
        }
    }
}
