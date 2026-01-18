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
                'pets' => [],
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

        // Get pets data (limit to 5 for dashboard)
        $pets = $client->pets()->with(['breed.species'])->limit(5)->get()->map(function ($pet) {
            return [
                'uuid' => $pet->uuid,
                'name' => $pet->name,
                'breed' => $pet->breed?->breed_name,
                'species' => $pet->breed?->species?->name,
                'avatar' => $pet->profile_img,
                'dob' => $pet->dob,
            ];
        })->toArray();

        // Convert appointments to array format
        $upcomingData = AppointmentResource::collection($upcomingAppointments)->toArray(request());

        return Inertia::render('Dashboards/User/index', [
            'upcomingAppointments' => $upcomingData,
            'statistics' => $statistics,
            'pets' => $pets,
            'client' => [
                'uuid' => $client->uuid,
                'first_name' => $client->first_name,
                'last_name' => $client->last_name,
            ],
        ]);
    }
}

