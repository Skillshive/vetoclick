<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Veterinary;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class VeterinarianController extends Controller
{
    /**
     * Get list of veterinarians with search and filter support
     */
    public function index(Request $request)
    {
        $query = Veterinary::with(['user', 'user.image', 'availabilitySchedules'])
            ->whereNotNull('address')
            ->where('address', '!=', '')
            ->whereNotNull('consultation_price')
            ->where('consultation_price', '>', 0);

        // Search functionality
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('clinic_name', 'like', "%{$search}%")
                  ->orWhere('specialization', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($userQuery) use ($search) {
                      $userQuery->where('firstname', 'like', "%{$search}%")
                                ->orWhere('lastname', 'like', "%{$search}%")
                                ->orWhere(DB::raw("CONCAT(firstname, ' ', lastname)"), 'like', "%{$search}%");
                  });
            });
        }

        // Filter by specialization
        if ($request->has('specializations') && is_array($request->specializations) && count($request->specializations) > 0) {
            $query->whereIn('specialization', $request->specializations);
        }

        // Filter by price range
        if ($request->has('price_min') && $request->price_min) {
            $query->where('consultation_price', '>=', $request->price_min);
        }
        if ($request->has('price_max') && $request->price_max) {
            $query->where('consultation_price', '<=', $request->price_max);
        }

        // Filter by video consultation (if this field exists in the future)
        // For now, we'll skip this as it's not in the database

        // Get results
        $veterinarians = $query->get();

        // Transform data to match frontend expectations
        $transformed = $veterinarians->map(function ($vet) use ($request) {
            $user = $vet->user;
            $fullName = $user ? trim(($user->firstname ?? '') . ' ' . ($user->lastname ?? '')) : 'Unknown';
            
            // Get avatar URL
            $avatarUrl = null;
            if ($user && $user->image) {
                $avatarUrl = $user->image->url ?? asset('storage/' . $user->image->path);
            }

            $lat = null;
            $lng = null;
            if ($vet->address) {
                if (preg_match('/(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/', $vet->address, $matches)) {
                    $lat = (float) $matches[1];
                    $lng = (float) $matches[2];
                    if ($lat < -90 || $lat > 90 || $lng < -180 || $lng > 180) {
                        $lat = null;
                        $lng = null;
                    }
                }
            }

            $distance = null;
            if ($request->has('user_lat') && $request->has('user_lng') && $lat && $lng) {
                $distance = $this->calculateDistance(
                    $request->user_lat,
                    $request->user_lng,
                    $lat,
                    $lng
                );
            }

            $rating = 4.5 + (rand(0, 10) / 10); 
            $reviewCount = rand(50, 300);

            // Calculate availability based on actual schedule
            $availability = $this->calculateAvailability($vet);

            return [
                'uuid' => $vet->uuid,
                'name' => $fullName,
                'clinic' => $vet->clinic_name ?? 'Veterinary Clinic',
                'specialization' => $vet->specialization ?? 'General Practice',
                'experience' => $vet->years_experience ?? 0,
                'rating' => round($rating, 1),
                'reviewCount' => $reviewCount,
                'lat' => $lat,
                'lng' => $lng,
                'availability' => $availability,
                'price' => $vet->consultation_price ?? 0,
                'distance' => $distance ? round($distance, 1) : null,
                'address' => $vet->address,
                'phone' => $user->phone ?? null,
                'images' => $avatarUrl ? [$avatarUrl] : [],
                'videoConseil' => false, // Placeholder - add to database if needed
                'acceptsInsurance' => true, // Placeholder
                'nextAvailable' => 'Today', // Placeholder - should be calculated
                'services' => $this->getServicesForSpecialization($vet->specialization),
                'facilities' => ['Parking', 'Wheelchair Access'], // Placeholder
            ];
        });

        // Sort by distance if user location is provided
        if ($request->has('user_lat') && $request->has('user_lng')) {
            $transformed = $transformed->sortBy('distance')->values();
        }

        return response()->json($transformed);
    }

    /**
     * Calculate distance between two coordinates (Haversine formula)
     */
    private function calculateDistance($lat1, $lon1, $lat2, $lon2)
    {
        $earthRadius = 6371; // Earth's radius in kilometers

        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($dLon / 2) * sin($dLon / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        $distance = $earthRadius * $c;

        return $distance;
    }

    /**
     * Get services based on specialization
     */
    private function getServicesForSpecialization($specialization)
    {
        $servicesMap = [
            'General Practice' => ['Vaccination', 'Check-ups', 'Pet Grooming', 'Emergency Care'],
            'Surgery' => ['Advanced Surgery', 'Orthopedics', 'Dental Surgery', 'Post-op Care'],
            'Emergency Care' => ['Emergency Surgery', 'Critical Care', 'Trauma Care', 'Blood Work'],
            'Dentistry' => ['Dental Cleaning', 'Orthodontics', 'Oral Surgery', 'Pet Dental Care'],
            'Cardiology' => ['Cardiac Surgery', 'Echocardiography', 'Heart Disease Treatment'],
            'Dermatology' => ['Allergy Testing', 'Skin Treatment', 'Hair Loss Treatment'],
            'Oncology' => ['Cancer Treatment', 'Chemotherapy', 'Radiation Therapy'],
            'Orthopedics' => ['Joint Surgery', 'Physical Therapy', 'Sports Medicine', 'Rehabilitation'],
            'Internal Medicine' => ['Diagnostic Services', 'Chronic Disease Management', 'Preventive Care'],
            'Exotic Animals' => ['Exotic Pet Care', 'Avian Medicine', 'Reptile Care'],
        ];

        return $servicesMap[$specialization] ?? ['General Veterinary Services'];
    }

    /**
     * Calculate availability based on vet's schedule
     */
    private function calculateAvailability($vet)
    {
        $schedules = $vet->availabilitySchedules()->where('is_break', false)->get();
        
        // If no schedules, return closed
        if ($schedules->isEmpty()) {
            return 'Closed';
        }

        // Get current day and time in Morocco timezone
        $now = now('Africa/Casablanca');
        $currentDay = strtolower($now->format('l')); // Monday, Tuesday, etc.
        $currentTime = $now->format('H:i:s');

        // Map day names to database format (assuming day_of_week stores as: monday, tuesday, etc.)
        $dayMap = [
            'monday' => 'monday',
            'tuesday' => 'tuesday',
            'wednesday' => 'wednesday',
            'thursday' => 'thursday',
            'friday' => 'friday',
            'saturday' => 'saturday',
            'sunday' => 'sunday',
        ];

        $currentDayName = $dayMap[$currentDay] ?? null;

        // Check if vet has 24/7 availability (all days covered)
        $allDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        $hasAllDays = true;
        foreach ($allDays as $day) {
            if (!$schedules->where('day_of_week', $day)->first()) {
                $hasAllDays = false;
                break;
            }
        }

        if ($hasAllDays) {
            // Check if current time is within any schedule for today
            $todaySchedule = $schedules->where('day_of_week', $currentDayName)->first();
            if ($todaySchedule && $currentTime >= $todaySchedule->start_time && $currentTime <= $todaySchedule->end_time) {
                return '24/7';
            }
        }

        // Check if currently open based on today's schedule
        if ($currentDayName) {
            $todaySchedule = $schedules->where('day_of_week', $currentDayName)->first();
            if ($todaySchedule && $currentTime >= $todaySchedule->start_time && $currentTime <= $todaySchedule->end_time) {
                return 'Open Now';
            }
        }

        // Otherwise closed
        return 'Closed';
    }
}
