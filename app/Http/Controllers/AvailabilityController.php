<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Services\AvailabilityService;
use App\common\AvaibilityDto;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Exception;
use Illuminate\Support\Facades\Auth;

class AvailabilityController extends Controller
{
    protected AvailabilityService $availabilityService;

    public function __construct(AvailabilityService $availabilityService)
    {
        $this->availabilityService = $availabilityService;
    }

    /**
     * Get all availabilities for the authenticated user (JSON response for AJAX)
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            if (!$user->veterinary) {
                return response()->json([
                    'success' => false,
                    'message' => 'Veterinary profile not found'
                ], 404);
            }
            $availabilities = $this->availabilityService->getWeeklySchedule($user->veterinary->id);
            
            return response()->json([
                'success' => true,
                'data' => $availabilities->map(function ($availability) {
                    return [
                        'uuid' => $availability->uuid,
                        'veterinary_id' => $availability->veterinary_id,
                        'day_of_week' => $availability->day_of_week,
                        'start_time' => $availability->start_time,
                        'end_time' => $availability->end_time,
                        'is_available' => $availability->is_available ?? true,
                        'created_at' => $availability->created_at,
                        'updated_at' => $availability->updated_at,
                    ];
                })
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve availabilities',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get availability by UUID (JSON response for AJAX)
     */
    public function show(string $uuid): JsonResponse
    {
        try {
            $availability = $this->availabilityService->getByUuid($uuid);
            
            if (!$availability) {
                return response()->json([
                    'success' => false,
                    'message' => 'Availability not found'
                ], 404);
            }

            // Check if user owns this availability
            if ($availability->veterinarian_id !== Auth::id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access to availability'
                ], 403);
            }
            
            return response()->json([
                'success' => true,
                'data' => [
                    'uuid' => $availability->uuid,
                    'veterinary_id' => $availability->veterinary_id,
                    'day_of_week' => $availability->day_of_week,
                    'start_time' => $availability->start_time,
                    'end_time' => $availability->end_time,
                    'is_available' => $availability->is_available ?? true,
                    'created_at' => $availability->created_at,
                    'updated_at' => $availability->updated_at,
                ]
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve availability',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create a new availability slot
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'day_of_week' => 'required|string|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
                'start_time' => 'required|date_format:H:i:s',
                'end_time' => 'required|date_format:H:i:s|after:start_time',
                'is_available' => 'boolean',
                'notes' => 'nullable|string|max:500'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = Auth::user();
            if (!$user->veterinary) {
                return response()->json([
                    'success' => false,
                    'message' => 'Veterinary profile not found'
                ], 404);
            }

            $dto = new AvaibilityDto(
                veterinarian_id: $user->veterinary->id,
                day_of_week: strtolower($request->day_of_week),
                start_time: $request->start_time,
                end_time: $request->end_time
            );
            
            $availability = $this->availabilityService->create($dto);
            
            return response()->json([
                'success' => true,
                'message' => 'Availability created successfully',
                'data' => [
                    'uuid' => $availability->uuid,
                    'veterinary_id' => $availability->veterinary_id,
                    'day_of_week' => $availability->day_of_week,
                    'start_time' => $availability->start_time,
                    'end_time' => $availability->end_time,
                    'is_available' => $availability->is_available ?? true,
                    'created_at' => $availability->created_at,
                    'updated_at' => $availability->updated_at,
                ]
            ], 201);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create availability',
            ], 500);
        }
    }
    /**
     * Delete availability by UUID
     */
    public function destroy(string $uuid): JsonResponse
    {
        try {
            $availability = $this->availabilityService->getByUuid($uuid);
            
            if (!$availability) {
                return response()->json([
                    'success' => false,
                    'message' => 'Availability not found'
                ], 404);
            }

            // Check if user owns this availability
            if ($availability->veterinarian_id !== Auth::id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access to availability'
                ], 403);
            }

            $this->availabilityService->delete($uuid);
            
            return response()->json([
                'success' => true,
                'message' => 'Availability deleted successfully'
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete availability',
            ], 500);
        }
    }


    /**
     * Get current week availability for authenticated user
     */
    public function getCurrentWeek(): JsonResponse
    {
        try {
            // dd("hello");
            $user = Auth::user();
            if (!$user->veterinary) {
                return response()->json([
                    'success' => false,
                    'message' => 'Veterinary profile not found'
                ], 404);
            }
            $availability = $this->availabilityService->getCurrentWeekAvailability($user->veterinary->id);
            
            return response()->json([
                'success' => true,
                'data' => $availability->map(function ($item) {
                    return [
                        'uuid' => $item->uuid,
                        'veterinary_id' => $item->veterinary_id,
                        'day_of_week' => $item->day_of_week,
                        'start_time' => $item->start_time,
                        'end_time' => $item->end_time,
                        'is_available' => $item->is_available ?? true,
                        'created_at' => $item->created_at,
                        'updated_at' => $item->updated_at,
                    ];
                })
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve current week availability',
            ], 500);
        }
    }

    /**
     * Check if veterinary is available at specific time
     */
    public function checkAvailability(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'veterinary_id' => 'sometimes|integer',
                'day_of_week' => 'required|string|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
                'time' => 'required|date_format:H:i:s'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                ], 422);
            }

            $veterinaryId = $request->input('veterinary_id', Auth::id());
            $dayOfWeek = $request->input('day_of_week');
            $time = $request->input('time');

            $isAvailable = $this->availabilityService->isVeterinaryAvailable(
                $veterinaryId, 
                strtolower($dayOfWeek), 
                $time
            );
            
            return response()->json([
                'success' => true,
                'data' => [
                    'is_available' => $isAvailable,
                    'veterinary_id' => $veterinaryId,
                    'day_of_week' => $dayOfWeek,
                    'time' => $time
                ]
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to check availability',
            ], 500);
        }
    }
}