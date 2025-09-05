<?php

namespace App\Services;

use App\Models\Availability;
use App\common\AvaibilityDto;
use App\Interfaces\ServiceInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Exception;

class AvailabilityService implements ServiceInterface
{

    /**
     * Get availability by UUID
     */
    public function getByUuid(string $uuid): ?Availability
    {
        return Availability::with(['veterinary'])
            ->where('uuid', $uuid)
            ->first();
    }

    /**
     * Create new availability from DTO
     */
    public function create(AvaibilityDto $dto): Availability
    {
        try {
            $this->validateAvailabilityData($dto->toCreateArray());
            $availability = Availability::create($dto->toCreateArray());
            return $availability->load(['veterinary']);
        } catch (Exception $e) {
            throw new Exception("Failed to create availability: " . $e->getMessage());
        }
    }
    /**
     * Delete availability by UUID
     */
    public function delete(string $uuid): bool
    {
        try {
            $availability = $this->getByUuid($uuid);
            
            if (!$availability) {
                return false;
            }

            return $availability->delete();
        } catch (Exception $e) {
            throw new Exception("Failed to delete availability: " . $e->getMessage());
        }
    }

    /**
     * Get availability by veterinary ID and day of week
     */
    public function getByVeterinaryAndDay(int $veterinaryId, string $dayOfWeek): Collection
    {
        return Availability::where('veterinarian_id', $veterinaryId)
            ->where('day_of_week', $dayOfWeek)
            ->where('is_available', true)
            ->orderBy('start_time', 'asc')
            ->get();
    }

    /**
     * Get all available time slots for a veterinary on a specific day
     */
    public function getAvailableSlots(int $veterinaryId, string $dayOfWeek): Collection
    {
        return Availability::where('veterinarian_id', $veterinaryId)
            ->where('day_of_week', $dayOfWeek)
            ->where('is_available', true)
            ->orderBy('start_time', 'asc')
            ->get();
    }

    /**
     * Check if veterinary is available at specific time
     */
    public function isVeterinaryAvailable(int $veterinaryId, string $dayOfWeek, string $time): bool
    {
        return Availability::where('veterinarian_id', $veterinaryId)
            ->where('day_of_week', $dayOfWeek)
            ->where('is_available', true)
            ->where('start_time', '<=', $time)
            ->where('end_time', '>=', $time)
            ->where(function($query) use ($time) {
                $query->whereNull('break_start_time')
                      ->orWhereNull('break_end_time')
                      ->orWhere('break_start_time', '>', $time)
                      ->orWhere('break_end_time', '<', $time);
            })
            ->exists();
    }

    /**
     * Get weekly schedule for a veterinary
     */
    public function getWeeklySchedule(int $veterinaryId): Collection
    {
        return Availability::where('veterinarian_id', $veterinaryId)
            ->orderBy('day_of_week', 'asc')
            ->orderBy('start_time', 'asc')
            ->get()
            ->groupBy('day_of_week');
    }

    /**
     * Toggle availability status
     */
    public function toggleAvailability(string $uuid): ?Availability
    {
        try {
            $availability = $this->getByUuid($uuid);
            
            if (!$availability) {
                return null;
            }

            $availability->update(['is_available' => !$availability->is_available]);
            return $availability->fresh(['veterinary']);
        } catch (Exception $e) {
            throw new Exception("Failed to toggle availability: " . $e->getMessage());
        }
    }

    /**
     * Validate availability data
     */
    protected function validateAvailabilityData(array $data): void
    {
        // Validate day of week
        if (isset($data['day_of_week'])) {
            $validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
            if (!in_array(strtolower($data['day_of_week']), $validDays)) {
                throw new Exception('Invalid day of week provided.');
            }
        }

        // Validate time format and logic
        if (isset($data['start_time']) && isset($data['end_time'])) {
            if ($data['start_time'] >= $data['end_time']) {
                throw new Exception('Start time must be before end time.');
            }
        }

        // Validate break times if provided
        if (isset($data['break_start_time']) && isset($data['break_end_time'])) {
            if ($data['break_start_time'] >= $data['break_end_time']) {
                throw new Exception('Break start time must be before break end time.');
            }

            // Check if break times are within working hours
            if (isset($data['start_time']) && isset($data['end_time'])) {
                if ($data['break_start_time'] < $data['start_time'] || 
                    $data['break_end_time'] > $data['end_time']) {
                    throw new Exception('Break times must be within working hours.');
                }
            }
        }
    }

    /**
     * Check for overlapping availability for the same veterinary and day
     */
    public function checkForOverlaps(int $veterinaryId, string $dayOfWeek, string $startTime, string $endTime, ?int $excludeId = null): bool
    {
        $query = Availability::where('veterinarian_id', $veterinaryId)
            ->where('day_of_week', $dayOfWeek)
            ->where(function($q) use ($startTime, $endTime) {
                $q->whereBetween('start_time', [$startTime, $endTime])
                  ->orWhereBetween('end_time', [$startTime, $endTime])
                  ->orWhere(function($q) use ($startTime, $endTime) {
                      $q->where('start_time', '<=', $startTime)
                        ->where('end_time', '>=', $endTime);
                  });
            });

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        return $query->exists();
    }

    /**
     * Store weekly availability - delete existing week data and insert new values
     */
    public function storeWeeklyAvailability(int $veterinaryId, array $weeklyData): bool
    {
        try {
            // Start database transaction
            DB::beginTransaction();

            // Get current week start and end dates
            $currentWeekStart = now()->startOfWeek()->format('Y-m-d');
            $currentWeekEnd = now()->endOfWeek()->format('Y-m-d');

            // Delete existing availability for current week
            $this->deleteCurrentWeekAvailability($veterinaryId);

            // Insert new weekly data
            foreach ($weeklyData as $dayData) {
                if (is_array($dayData)) {
                    $dto = new AvaibilityDto(
                        veterinarian_id: $veterinaryId,
                        day_of_week: $dayData['day_of_week'] ?? '',
                        start_time: $dayData['start_time'] ?? '',
                        end_time: $dayData['end_time'] ?? ''
                    );
                    $this->create($dto);
                }
            }

            DB::commit();
            return true;
        } catch (Exception $e) {
            DB::rollBack();
            throw new Exception("Failed to store weekly availability: " . $e->getMessage());
        }
    }

    /**
     * Delete current week availability for a veterinary
     */
    public function deleteCurrentWeekAvailability(int $veterinaryId): bool
    {
        try {
            // Get all days of current week
            $currentWeekDays = [
                now()->startOfWeek()->format('l'), // Monday
                now()->startOfWeek()->addDay(1)->format('l'), // Tuesday
                now()->startOfWeek()->addDay(2)->format('l'), // Wednesday
                now()->startOfWeek()->addDay(3)->format('l'), // Thursday
                now()->startOfWeek()->addDay(4)->format('l'), // Friday
                now()->startOfWeek()->addDay(5)->format('l'), // Saturday
                now()->startOfWeek()->addDay(6)->format('l'), // Sunday
            ];

            // Convert to lowercase for database comparison
            $weekDays = array_map('strtolower', $currentWeekDays);

            return Availability::where('veterinarian_id', $veterinaryId)
                ->whereIn('day_of_week', $weekDays)
                ->delete();
        } catch (Exception $e) {
            throw new Exception("Failed to delete current week availability: " . $e->getMessage());
        }
    }

    /**
     * Check if veterinary has availability data for current week
     */
    public function hasCurrentWeekAvailability(int $veterinaryId): bool
    {
        // Get all days of current week
        $currentWeekDays = [
            now()->startOfWeek()->format('l'), // Monday
            now()->startOfWeek()->addDay(1)->format('l'), // Tuesday
            now()->startOfWeek()->addDay(2)->format('l'), // Wednesday
            now()->startOfWeek()->addDay(3)->format('l'), // Thursday
            now()->startOfWeek()->addDay(4)->format('l'), // Friday
            now()->startOfWeek()->addDay(5)->format('l'), // Saturday
            now()->startOfWeek()->addDay(6)->format('l'), // Sunday
        ];

        // Convert to lowercase for database comparison
        $weekDays = array_map('strtolower', $currentWeekDays);

        return Availability::where('veterinarian_id', $veterinaryId)
            ->whereIn('day_of_week', $weekDays)
            ->exists();
    }

    /**
     * Get current week availability for a veterinary
     */
    public function getCurrentWeekAvailability(int $veterinaryId): Collection
    {
        // Get all days of current week
        $currentWeekDays = [
            now()->startOfWeek()->format('l'), // Monday
            now()->startOfWeek()->addDay(1)->format('l'), // Tuesday
            now()->startOfWeek()->addDay(2)->format('l'), // Wednesday
            now()->startOfWeek()->addDay(3)->format('l'), // Thursday
            now()->startOfWeek()->addDay(4)->format('l'), // Friday
            now()->startOfWeek()->addDay(5)->format('l'), // Saturday
            now()->startOfWeek()->addDay(6)->format('l'), // Sunday
        ];

        // Convert to lowercase for database comparison
        $weekDays = array_map('strtolower', $currentWeekDays);

        return Availability::where('veterinarian_id', $veterinaryId)
            ->whereIn('day_of_week', $weekDays)
            ->orderBy('day_of_week', 'asc')
            ->orderBy('start_time', 'asc')
            ->get();
    }
}