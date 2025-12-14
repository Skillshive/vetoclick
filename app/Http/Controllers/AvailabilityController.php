<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Services\AvailabilityService;
use App\common\AvaibilityDto;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
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
     * Create a new availability slot
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'day_of_week' => 'required|string|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
                'start_time' => 'required|date_format:H:i:s',
                'end_time' => 'required|date_format:H:i:s|after:start_time',
                'is_break' => 'nullable|boolean',
                'notes' => 'nullable|string|max:500'
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

            $dto = new AvaibilityDto(
                veterinarian_id: $user->veterinary->getKey(),
                day_of_week: strtolower($request->day_of_week),
                start_time: $request->start_time,
                end_time: $request->end_time,
                is_break: $request->boolean('is_break', false)
            );

            $availability = $this->availabilityService->create($dto);

            return response()->json([
                'success' => true,
                'message' => __('common.availability_created_successfully'),
                'data' => [
                    'uuid' => $availability->uuid,
                    'veterinary_id' => $availability->veterinary_id,
                    'day_of_week' => $availability->day_of_week,
                    'start_time' => $availability->start_time,
                    'end_time' => $availability->end_time,
                    'is_break' => $availability->is_break ?? false,
                    'created_at' => $availability->created_at,
                    'updated_at' => $availability->updated_at,
                ]
            ], 201);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => __('common.failed_to_create_availability'),
                'error' => config('app.debug') ? $e->getMessage() : null
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
                    'message' => __('common.availability_not_found')
                ], 404);
            }

            // Check if user owns this availability
            if ($availability->veterinarian_id !== Auth::id()) {
                return response()->json([
                    'success' => false,
                    'message' => __('common.unauthorized_access_to_availability')
                ], 403);
            }

            $this->availabilityService->delete($uuid);

            return response()->json([
                'success' => true,
                'message' => __('common.availability_deleted_successfully')
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => __('common.failed_to_delete_availability'),
            ], 500);
        }
    }


    /**
     * Get current week availability for authenticated user
     */
    public function getCurrentWeek(): JsonResponse
    {
        try {
            $user = Auth::user();
            if (!$user->veterinary) {
                return response()->json([
                    'success' => false,
                    'message' => __('common.veterinary_profile_not_found')
                ], 404);
            }
            $availability = $this->availabilityService->getCurrentWeekAvailability($user->veterinary->id);

            return response()->json([
                'success' => true,
                'total_slots' => $this->calculateTotalSlots($availability),
                        'total_hours' => $this->calculateTotalHours($availability),
                        'week_coverage' => $this->calculateWeekCoverage($availability),
                        'peak_hours' => $this->calculatePeakHours($availability),
                        'least_busy_hours' => $this->calculateLeastBusyHours($availability),
                        'daily_average' => $this->calculateDailyAverage($availability),
                        'most_available_day' => $this->getMostAvailableDay($availability),
                        'availability_data' => $availability,
                'data' => $availability->map(function ($item) {
                    return [
                        'uuid' => $item->uuid,
                        'veterinary_id' => $item->veterinary_id,
                        'day_of_week' => $item->day_of_week,
                        'start_time' => $item->start_time,
                        'end_time' => $item->end_time,
                        'is_break' => $item->is_break ?? false,
                        'created_at' => $item->created_at,
                        'updated_at' => $item->updated_at,
                    ];
                })
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => __('common.failed_to_retrieve_current_week_availability'),
                'error' => config('app.debug') ? $e->getMessage() : null
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
                    'message' => __('common.validation_failed'),
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
                'message' => __('common.failed_to_check_availability'),
            ], 500);
        }
    }

    /**
     * Calculate total 15-minute slots
     */
    private function calculateTotalSlots($availabilityData): int
    {
        $totalSlots = 0;

        foreach ($availabilityData as $slot) {
            // Skip breaks when calculating total slots
            if (isset($slot->is_break) && $slot->is_break) {
                continue;
            }
            $startTime = strtotime($slot->start_time);
            $endTime = strtotime($slot->end_time);
            $diffMinutes = ($endTime - $startTime) / 60;
            $slots = $diffMinutes / 15;
            $totalSlots += $slots;
        }

        return (int) $totalSlots;
    }

    /**
     * Calculate total hours per week
     */
    private function calculateTotalHours($availabilityData): float
    {
        $totalMinutes = 0;

        foreach ($availabilityData as $slot) {
            // Skip breaks when calculating total hours
            if (isset($slot->is_break) && $slot->is_break) {
                continue;
            }
            $startTime = strtotime($slot->start_time);
            $endTime = strtotime($slot->end_time);
            $diffMinutes = ($endTime - $startTime) / 60;
            $totalMinutes += $diffMinutes;
        }

        return round($totalMinutes / 60, 1);
    }

    /**
     * Calculate week coverage percentage
     */
    private function calculateWeekCoverage($availabilityData): int
    {
        // Working hours: Monday-Friday 8AM-6PM = 50 hours per week
        // Saturday 8AM-2PM = 6 hours per week
        // Total = 56 hours
        $totalWorkingMinutes = (50 + 6) * 60; // 3360 minutes

        $availableMinutes = 0;
        foreach ($availabilityData as $slot) {
            // Skip breaks when calculating week coverage
            if (isset($slot->is_break) && $slot->is_break) {
                continue;
            }
            $startTime = strtotime($slot->start_time);
            $endTime = strtotime($slot->end_time);
            $diffMinutes = ($endTime - $startTime) / 60;
            $availableMinutes += $diffMinutes;
        }

        $coverage = ($availableMinutes / $totalWorkingMinutes) * 100;
        return (int) round($coverage);
    }

    /**
     * Find peak hours (most booked time slots)
     */
    private function calculatePeakHours($availabilityData): array
    {
        $hourCounts = [];

        foreach ($availabilityData as $slot) {
            // Skip breaks when calculating peak hours
            if (isset($slot->is_break) && $slot->is_break) {
                continue;
            }
            $startHour = date('H', strtotime($slot->start_time));
            $hourCounts[$startHour] = ($hourCounts[$startHour] ?? 0) + 1;
        }

        // Handle empty data
        if (empty($hourCounts)) {
            return [
                'hour' => '09:00',
                'end_hour' => '10:00',
                'slots' => 0,
                'label' => '09:00 - 10:00'
            ];
        }

        arsort($hourCounts);
        $topHour = key($hourCounts);
        $count = reset($hourCounts);

        $endHour = (int)$topHour + 1;

        return [
            'hour' => $topHour . ':00',
            'end_hour' => str_pad($endHour, 2, '0', STR_PAD_LEFT) . ':00',
            'slots' => $count,
            'label' => $topHour . ':00 - ' . str_pad($endHour, 2, '0', STR_PAD_LEFT) . ':00'
        ];
    }

    /**
     * Find least busy hours
     */
    private function calculateLeastBusyHours($availabilityData): array
    {
        $hourCounts = [];

        // Initialize all hours with 0 (0-23)
        for ($i = 0; $i < 24; $i++) {
            $hourCounts[str_pad($i, 2, '0', STR_PAD_LEFT)] = 0;
        }

        // Count available slots per hour (only count non-break slots)
        foreach ($availabilityData as $slot) {
            // Skip breaks when calculating least busy hours
            if (isset($slot->is_break) && $slot->is_break) {
                continue;
            }
            $startHour = date('H', strtotime($slot->start_time));
            if (isset($hourCounts[$startHour])) {
                $hourCounts[$startHour]++;
            }
        }

        // Handle empty data
        if (empty($hourCounts)) {
            return [
                'hour' => '08:00',
                'end_hour' => '09:00',
                'slots' => 0,
                'label' => '08:00 - 09:00'
            ];
        }

        asort($hourCounts);
        $bottomHour = key($hourCounts);
        $count = reset($hourCounts);

        $endHour = (int)$bottomHour + 1;

        return [
            'hour' => $bottomHour . ':00',
            'end_hour' => str_pad($endHour, 2, '0', STR_PAD_LEFT) . ':00',
            'slots' => $count,
            'label' => $bottomHour . ':00 - ' . str_pad($endHour, 2, '0', STR_PAD_LEFT) . ':00'
        ];
    }

    /**
     * Calculate daily average hours
     */
    private function calculateDailyAverage($availabilityData): float
    {
        if (empty($availabilityData) || $availabilityData->isEmpty()) {
            return 0.0;
        }

        $daysWithAvailability = $availabilityData->pluck('day_of_week')->unique()->count();
        
        if ($daysWithAvailability === 0) {
            return 0.0;
        }
        
        $totalHours = $this->calculateTotalHours($availabilityData);

        $average = $totalHours / $daysWithAvailability;
        return round($average, 1);
    }

    /**
     * Get most available day
     */
    private function getMostAvailableDay($availabilityData): array
    {
        $dayMinutes = [];
        $dayNames = [
            'monday' => 'Monday',
            'tuesday' => 'Tuesday',
            'wednesday' => 'Wednesday',
            'thursday' => 'Thursday',
            'friday' => 'Friday',
            'saturday' => 'Saturday',
            'sunday' => 'Sunday'
        ];

        // Handle empty data
        if (empty($availabilityData) || $availabilityData->isEmpty()) {
            return [
                'day' => 'Monday',
                'hours' => 0,
                'slots' => 0
            ];
        }

        foreach ($availabilityData as $slot) {
            // Skip breaks when calculating most available day
            if (isset($slot->is_break) && $slot->is_break) {
                continue;
            }
            $day = $slot->day_of_week;
            if (!isset($dayMinutes[$day])) {
                $dayMinutes[$day] = 0;
            }

            $startTime = strtotime($slot->start_time);
            $endTime = strtotime($slot->end_time);
            $diffMinutes = ($endTime - $startTime) / 60;
            $dayMinutes[$day] += $diffMinutes;
        }

        if (empty($dayMinutes)) {
            return [
                'day' => 'No availability set',
                'hours' => 0
            ];
        }

        arsort($dayMinutes);
        $mostAvailableDay = key($dayMinutes);
        $hours = reset($dayMinutes) / 60;

        return [
            'day' => $dayNames[$mostAvailableDay] ?? ucfirst($mostAvailableDay),
            'hours' => round($hours, 1),
            'minutes' => (int)(reset($dayMinutes) % 60)
        ];
    }
}
