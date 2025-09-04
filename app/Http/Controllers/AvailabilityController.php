<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Services\AvailabilityService;
use App\common\AvaibilityDto;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Exception;

class AvailabilityController extends Controller
{
    protected AvailabilityService $availabilityService;

    public function __construct(AvailabilityService $availabilityService)
    {
        $this->availabilityService = $availabilityService;
    }

    /**
     * Display a listing of availability records
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $perPage = $request->get('per_page', 15);
            $availabilities = $this->availabilityService->getAll($perPage);
            
            return response()->json([
                'success' => true,
                'data' => $availabilities
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store weekly availability - delete existing week data and insert new values
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $veterinaryId = $request->input('veterinary_id');
            $weeklyData = $request->input('weekly_data', []);

            // Validate required data
            if (!$veterinaryId || empty($weeklyData)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Veterinary ID and weekly data are required'
                ], 400);
            }

            // Start database transaction
            DB::beginTransaction();

            // Check if veterinary has availability data for current week
            if ($this->availabilityService->hasCurrentWeekAvailability($veterinaryId)) {
                // Delete existing availability for current week
                $this->availabilityService->deleteCurrentWeekAvailability($veterinaryId);
            }

            // Insert new weekly data
            $createdAvailabilities = [];
            foreach ($weeklyData as $dayData) {
                if (is_array($dayData) && !empty($dayData['day_of_week'])) {
                    $dto = new AvaibilityDto(
                        veterinary_id: $veterinaryId,
                        day_of_week: strtolower($dayData['day_of_week']),
                        start_time: $dayData['start_time'] ?? '',
                        end_time: $dayData['end_time'] ?? '',
                        break_start_time: $dayData['break_start_time'] ?? null,
                        break_end_time: $dayData['break_end_time'] ?? null,
                        is_available: $dayData['is_available'] ?? true,
                        notes: $dayData['notes'] ?? null
                    );
                    
                    $availability = $this->availabilityService->create($dto);
                    $createdAvailabilities[] = $availability;
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Weekly availability updated successfully',
                'data' => $createdAvailabilities
            ]);

        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to store weekly availability: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified availability record
     */
    public function show(string $uuid): JsonResponse
    {
        try {
            $availability = $this->availabilityService->getByUuid($uuid);
            
            if (!$availability) {
                return response()->json([
                    'success' => false,
                    'message' => 'Availability record not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $availability
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified availability record
     */
    public function update(Request $request, string $uuid): JsonResponse
    {
        try {
            $dto = AvaibilityDto::fromRequest($request);
            $availability = $this->availabilityService->update($uuid, $dto);
            
            if (!$availability) {
                return response()->json([
                    'success' => false,
                    'message' => 'Availability record not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Availability updated successfully',
                'data' => $availability
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified availability record
     */
    public function destroy(string $uuid): JsonResponse
    {
        try {
            $deleted = $this->availabilityService->delete($uuid);
            
            if (!$deleted) {
                return response()->json([
                    'success' => false,
                    'message' => 'Availability record not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Availability deleted successfully'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get availability by veterinary ID
     */
    public function getByVeterinary(Request $request, int $veterinaryId): JsonResponse
    {
        try {
            $perPage = $request->get('per_page', 15);
            $availabilities = $this->availabilityService->getByVeterinaryId($veterinaryId, $perPage);
            
            return response()->json([
                'success' => true,
                'data' => $availabilities
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get current week availability for a veterinary
     */
    public function getCurrentWeek(int $veterinaryId): JsonResponse
    {
        try {
            $availability = $this->availabilityService->getCurrentWeekAvailability($veterinaryId);
            
            return response()->json([
                'success' => true,
                'data' => $availability
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get weekly schedule for a veterinary
     */
    public function getWeeklySchedule(int $veterinaryId): JsonResponse
    {
        try {
            $schedule = $this->availabilityService->getWeeklySchedule($veterinaryId);
            
            return response()->json([
                'success' => true,
                'data' => $schedule
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check if veterinary is available at specific time
     */
    public function checkAvailability(Request $request): JsonResponse
    {
        try {
            $veterinaryId = $request->input('veterinary_id');
            $dayOfWeek = $request->input('day_of_week');
            $time = $request->input('time');

            if (!$veterinaryId || !$dayOfWeek || !$time) {
                return response()->json([
                    'success' => false,
                    'message' => 'Veterinary ID, day of week, and time are required'
                ], 400);
            }

            $isAvailable = $this->availabilityService->isVeterinaryAvailable(
                $veterinaryId, 
                strtolower($dayOfWeek), 
                $time
            );
            
            return response()->json([
                'success' => true,
                'data' => [
                    'is_available' => $isAvailable
                ]
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}