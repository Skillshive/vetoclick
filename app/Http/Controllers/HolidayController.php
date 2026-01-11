<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Services\HolidayService;
use App\common\HolidayDto;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Exception;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class HolidayController extends Controller
{
    protected HolidayService $holidayService;

    public function __construct(HolidayService $holidayService)
    {
        $this->holidayService = $holidayService;
    }

    /**
     * Create a new holiday
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'start_date' => 'required|date|after_or_equal:today',
                'end_date' => 'required|date|after_or_equal:start_date',
                'reason' => 'nullable|string|max:255',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => __('common.validation_failed'),
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = Auth::user();
            if (!$user->veterinary) {
                return response()->json([
                    'success' => false,
                    'message' => __('common.veterinary_profile_not_found')
                ], 404);
            }

            // Check for overlapping holidays
            $overlappingHolidays = $this->holidayService->getHolidaysInRange(
                $user->veterinary->id,
                $request->start_date,
                $request->end_date
            );

            if ($overlappingHolidays->isNotEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => __('common.holiday_already_exists')
                ], 422);
            }

            $dto = new HolidayDto(
                veterinarian_id: $user->veterinary->id,
                start_date: $request->start_date,
                end_date: $request->end_date,
                reason: $request->reason
            );

            $holiday = $this->holidayService->create($dto);

            return response()->json([
                'success' => true,
                'message' => __('common.holiday_created_successfully'),
                'data' => [
                    'uuid' => $holiday->uuid,
                    'veterinarian_id' => $holiday->veterinarian_id,
                    'start_date' => $holiday->start_date->format('Y-m-d'),
                    'end_date' => $holiday->end_date->format('Y-m-d'),
                    'reason' => $holiday->reason,
                    'created_at' => $holiday->created_at,
                    'updated_at' => $holiday->updated_at,
                ]
            ], 201);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => __('common.failed_to_create_holiday'),
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Delete holiday by UUID
     */
    public function destroy(string $uuid): JsonResponse
    {
        try {
            $holiday = $this->holidayService->getByUuid($uuid);

            if (!$holiday) {
                return response()->json([
                    'success' => false,
                    'message' => __('common.holiday_not_found')
                ], 404);
            }

            // Verify the holiday belongs to the authenticated user
            $user = Auth::user();
            if (!$user->veterinary || $holiday->veterinarian_id !== $user->veterinary->id) {
                return response()->json([
                    'success' => false,
                    'message' => __('common.unauthorized')
                ], 403);
            }

            $this->holidayService->delete($uuid);

            return response()->json([
                'success' => true,
                'message' => __('common.holiday_deleted_successfully')
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => __('common.failed_to_delete_holiday'),
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Get all holidays for authenticated veterinarian
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            if (!$user->veterinary) {
                return response()->json([
                    'success' => false,
                    'message' => __('common.veterinary_profile_not_found')
                ], 404);
            }

            $holidays = $this->holidayService->getByVeterinarian($user->veterinary->id);

            return response()->json([
                'success' => true,
                'data' => $holidays->map(function ($holiday) {
                    return [
                        'uuid' => $holiday->uuid,
                        'veterinarian_id' => $holiday->veterinarian_id,
                        'start_date' => $holiday->start_date->format('Y-m-d'),
                        'end_date' => $holiday->end_date->format('Y-m-d'),
                        'reason' => $holiday->reason,
                        'created_at' => $holiday->created_at,
                        'updated_at' => $holiday->updated_at,
                    ];
                })
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => __('common.failed_to_fetch_holidays'),
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Get upcoming holidays
     */
    public function upcoming(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            if (!$user->veterinary) {
                return response()->json([
                    'success' => false,
                    'message' => __('common.veterinary_profile_not_found')
                ], 404);
            }

            $months = $request->input('months', 3);
            $holidays = $this->holidayService->getUpcomingHolidays($user->veterinary->id, $months);

            return response()->json([
                'success' => true,
                'data' => $holidays->map(function ($holiday) {
                    return [
                        'uuid' => $holiday->uuid,
                        'veterinarian_id' => $holiday->veterinarian_id,
                        'start_date' => $holiday->start_date->format('Y-m-d'),
                        'end_date' => $holiday->end_date->format('Y-m-d'),
                        'reason' => $holiday->reason,
                        'created_at' => $holiday->created_at,
                        'updated_at' => $holiday->updated_at,
                    ];
                })
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => __('common.failed_to_fetch_holidays'),
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }
}

