<?php

namespace App\Services;

use App\Models\Holiday;
use App\common\HolidayDto;
use Illuminate\Database\Eloquent\Collection;
use Exception;
use Carbon\Carbon;

class HolidayService
{
    /**
     * Get holiday by UUID
     */
    public function getByUuid(string $uuid): ?Holiday
    {
        return Holiday::with(['veterinarian'])
            ->where('uuid', $uuid)
            ->first();
    }

    /**
     * Create new holiday from DTO
     */
    public function create(HolidayDto $dto): Holiday
    {
        try {
            $holiday = Holiday::create($dto->toArray());
            return $holiday;
        } catch (Exception $e) {
            throw new Exception("Failed to create holiday: " . $e->getMessage());
        }
    }

    /**
     * Delete holiday by UUID
     */
    public function delete(string $uuid): bool
    {
        try {
            $holiday = $this->getByUuid($uuid);
            
            if (!$holiday) {
                return false;
            }

            return $holiday->delete();
        } catch (Exception $e) {
            throw new Exception("Failed to delete holiday: " . $e->getMessage());
        }
    }

    /**
     * Get all holidays for a veterinarian
     */
    public function getByVeterinarian(int $veterinarianId): Collection
    {
        return Holiday::where('veterinarian_id', $veterinarianId)
            ->orderBy('start_date', 'asc')
            ->get();
    }

    /**
     * Get upcoming holidays for a veterinarian
     */
    public function getUpcomingHolidays(int $veterinarianId, int $months = 3): Collection
    {
        $today = Carbon::today();
        $endDate = Carbon::today()->addMonths($months);

        return Holiday::where('veterinarian_id', $veterinarianId)
            ->where('end_date', '>=', $today)
            ->where('start_date', '<=', $endDate)
            ->orderBy('start_date', 'asc')
            ->get();
    }

    /**
     * Check if a date is a holiday for a veterinarian
     */
    public function isHoliday(int $veterinarianId, string $date): bool
    {
        return Holiday::where('veterinarian_id', $veterinarianId)
            ->where('start_date', '<=', $date)
            ->where('end_date', '>=', $date)
            ->exists();
    }

    /**
     * Get holidays in date range
     */
    public function getHolidaysInRange(int $veterinarianId, string $startDate, string $endDate): Collection
    {
        return Holiday::where('veterinarian_id', $veterinarianId)
            ->where(function ($query) use ($startDate, $endDate) {
                $query->whereBetween('start_date', [$startDate, $endDate])
                      ->orWhereBetween('end_date', [$startDate, $endDate])
                      ->orWhere(function ($q) use ($startDate, $endDate) {
                          $q->where('start_date', '<=', $startDate)
                            ->where('end_date', '>=', $endDate);
                      });
            })
            ->orderBy('start_date', 'asc')
            ->get();
    }
}

