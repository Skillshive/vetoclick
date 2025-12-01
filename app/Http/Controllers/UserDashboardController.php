<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Resources\AppointmentResource;
use App\Models\Client;
use App\Services\AppointmentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class UserDashboardController extends Controller
{
    protected AppointmentService $appointmentService;

    public function __construct(AppointmentService $appointmentService)
    {
        $this->appointmentService = $appointmentService;
    }

    /**
     * Get fallback data for demonstration purposes
     *
     * @return array
     */
    private function getFallbackData(): array
    {
        $today = Carbon::today();
        $tomorrow = $today->copy()->addDay();
        $nextWeek = $today->copy()->addWeek();
        $lastWeek = $today->copy()->subWeek();

        return [
            'upcomingAppointments' => array_slice([
                [
                    'uuid' => 'fallback-1',
                    'appointment_date' => $tomorrow->format('Y-m-d'),
                    'start_time' => '10:00',
                    'end_time' => '10:30',
                    'duration_minutes' => 30,
                    'status' => 'confirmed',
                    'is_video_conseil' => false,
                    'video_meeting_id' => null,
                    'video_join_url' => null,
                    'appointment_type' => 'Routine Check-up',
                    'reason_for_visit' => 'Annual vaccination and health check',
                    'appointment_notes' => null,
                    'pet' => [
                        'uuid' => 'pet-1',
                        'name' => 'Bella',
                        'breed' => 'Golden Retriever',
                        'avatar' => 'https://placedog.net/400/400?id=1',
                        'microchip' => '#123ABC',
                        'species' => 'Dogs',
                        'gender' => 'Female',
                        'dob' => '2020-05-15',
                        'wieght' => 25,
                    ],
                    'client' => [
                        'uuid' => 'client-1',
                        'first_name' => 'John',
                        'last_name' => 'Doe',
                        'avatar' => null,
                    ],
                ],
                [
                    'uuid' => 'fallback-2',
                    'appointment_date' => $nextWeek->format('Y-m-d'),
                    'start_time' => '14:00',
                    'end_time' => '14:45',
                    'duration_minutes' => 45,
                    'status' => 'confirmed',
                    'is_video_conseil' => true,
                    'video_meeting_id' => 'vid-001',
                    'video_join_url' => 'https://jitsi.colabcorner.com/vet-appt-' . $nextWeek->format('Ymd') . '-1400-abc123',
                    'appointment_type' => 'Video Consultation',
                    'reason_for_visit' => 'Follow-up on previous treatment',
                    'appointment_notes' => null,
                    'pet' => [
                        'uuid' => 'pet-2',
                        'name' => 'Max',
                        'breed' => 'German Shepherd',
                        'avatar' => 'https://placedog.net/400/400?id=2',
                        'microchip' => '#456DEF',
                        'species' => 'Dogs',
                        'gender' => 'Male',
                        'dob' => '2019-03-20',
                        'wieght' => 35,
                    ],
                    'client' => [
                        'uuid' => 'client-1',
                        'first_name' => 'John',
                        'last_name' => 'Doe',
                        'avatar' => null,
                    ],
                ],
            ], 0, 5),
            'recentAppointments' => array_slice([
                [
                    'uuid' => 'fallback-3',
                    'appointment_date' => $lastWeek->format('Y-m-d'),
                    'start_time' => '11:00',
                    'end_time' => '11:30',
                    'duration_minutes' => 30,
                    'status' => 'completed',
                    'is_video_conseil' => false,
                    'video_meeting_id' => null,
                    'video_join_url' => null,
                    'appointment_type' => 'Dental Cleaning',
                    'reason_for_visit' => 'Routine dental cleaning',
                    'appointment_notes' => 'Pet handled the procedure well',
                    'pet' => [
                        'uuid' => 'pet-1',
                        'name' => 'Bella',
                        'breed' => 'Golden Retriever',
                        'avatar' => 'https://placedog.net/400/400?id=1',
                        'microchip' => '#123ABC',
                        'species' => 'Dogs',
                        'gender' => 'Female',
                        'dob' => '2020-05-15',
                        'wieght' => 25,
                    ],
                    'client' => [
                        'uuid' => 'client-1',
                        'first_name' => 'John',
                        'last_name' => 'Doe',
                        'avatar' => null,
                    ],
                ],
                [
                    'uuid' => 'fallback-4',
                    'appointment_date' => $lastWeek->copy()->subDays(3)->format('Y-m-d'),
                    'start_time' => '15:00',
                    'end_time' => '15:30',
                    'duration_minutes' => 30,
                    'status' => 'completed',
                    'is_video_conseil' => false,
                    'video_meeting_id' => null,
                    'video_join_url' => null,
                    'appointment_type' => 'Vaccination',
                    'reason_for_visit' => 'Annual vaccination',
                    'appointment_notes' => 'All vaccinations up to date',
                    'pet' => [
                        'uuid' => 'pet-2',
                        'name' => 'Max',
                        'breed' => 'German Shepherd',
                        'avatar' => 'https://placedog.net/400/400?id=2',
                        'microchip' => '#456DEF',
                        'species' => 'Dogs',
                        'gender' => 'Male',
                        'dob' => '2019-03-20',
                        'wieght' => 35,
                    ],
                    'client' => [
                        'uuid' => 'client-1',
                        'first_name' => 'John',
                        'last_name' => 'Doe',
                        'avatar' => null,
                    ],
                ],
            ], 0, 5),
            'pets' => [
                [
                    'uuid' => 'pet-1',
                    'name' => 'Bella',
                    'breed' => 'Golden Retriever',
                    'species' => 'Dogs',
                    'avatar' => 'https://placedog.net/400/400?id=1',
                    'dob' => '2020-05-15',
                ],
                [
                    'uuid' => 'pet-2',
                    'name' => 'Max',
                    'breed' => 'German Shepherd',
                    'species' => 'Dogs',
                    'avatar' => 'https://placedog.net/400/400?id=2',
                    'dob' => '2019-03-20',
                ],
            ],
            'statistics' => [
                'totalAppointments' => 12,
                'upcomingAppointments' => 2,
                'completedAppointments' => 8,
                'cancelledAppointments' => 1,
                'videoConsultations' => 3,
                'totalPets' => 2,
            ],
        ];
    }

    /**
     * Display the user dashboard
     *
     * @return Response
     */
    public function index(): Response
    {
        $user = Auth::user();
        
        // Get the client associated with the user
        $client = $user->client;
        
        if (!$client) {
            // If no client found, return dashboard with empty statistics
            return Inertia::render('Dashboards/User/index', [
                'upcomingAppointments' => [],
                'statistics' => [
                    'totalAppointments' => 0,
                    'upcomingAppointments' => 0,
                    'completedAppointments' => 0,
                    'cancelledAppointments' => 0,
                    'videoConsultations' => 0,
                    'totalPets' => 0,
                ],
            ]);
        }

        // Get upcoming appointments (limit to 5) - always from database
        $upcomingAppointments = $this->appointmentService->getUpcomingByClientId($client->id, 5);
        
        // Get statistics from database - always use real data
        $statistics = $this->appointmentService->getClientStatistics($client->id);
        $statistics['totalPets'] = $client->pets()->count();

        // Convert appointments to array format
        $upcomingData = AppointmentResource::collection($upcomingAppointments)->toArray(request());

        return Inertia::render('Dashboards/User/index', [
            'upcomingAppointments' => $upcomingData,
            'statistics' => $statistics,
            'client' => [
                'uuid' => $client->uuid,
                'first_name' => $client->first_name,
                'last_name' => $client->last_name,
            ],
        ]);
    }
}

