<?php

namespace App\Services;

use App\Models\Availability;
use App\common\AvaibilityDto;
use App\Interfaces\ServiceInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Exception;
use Carbon\Carbon;

class AvailabilityService implements ServiceInterface
{

    /**
     * Get availability by UUID
     */
    public function getByUuid(string $uuid): ?Availability
    {
        return Availability::with(['veterinarian'])
            ->where('uuid', $uuid)
            ->first();
    }

    /**
     * Create new availability from DTO
     */
    public function create(AvaibilityDto $dto): Availability
    {
        try {
            $availability = Availability::create($dto->toArray());
            return $availability;
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
            ->orderBy('start_time', 'asc')
            ->get();
    }

    /**
     * Check if veterinary is available at specific time
     * If a row exists for that day and time, the vet is available
     */
    public function isVeterinaryAvailable(int $veterinaryId, string $dayOfWeek, string $time): bool
    {
        // Convert the provided time to a Carbon instance
        $selectedTime = Carbon::parse($time)->format('H:i:s');
        return Availability::where('veterinarian_id', $veterinaryId)
            ->where('day_of_week', $dayOfWeek)
            ->where('start_time', '<=', $selectedTime)
            ->where('end_time', '>=', $selectedTime)
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