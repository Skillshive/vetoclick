<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Resources\AppointmentResource;
use App\Http\Resources\PrescriptionResource;
use App\Http\Resources\UserResource;
use App\Models\Appointment;
use App\Models\Client;
use App\Models\Consultation;
use App\Models\Prescription;
use App\Models\User;
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


    public function getLastPrescriptions()
    {

        $clientId = Auth::user()->client->id;
        $prescriptions = Prescription::whereHas('consultation', function ($query) use ($clientId) {
            $query->where('client_id', $clientId);
        })->orderBy('created_at', 'desc')->limit(5)->get();
        return PrescriptionResource::collection($prescriptions)->toArray(request());
    }

    public function getMyDoctors()
    {
        $clientId = Auth::user()->client->id;

        // Get up to 5 vets who have had consultations with this client, including the count of consultations and vet city
        $vets = \App\Models\Veterinary::whereHas('consultations', function ($query) use ($clientId) {
                $query->where('client_id', $clientId);
            })
            ->withCount(['consultations as total_consultations' => function ($query) use ($clientId) {
                $query->where('client_id', $clientId);
            }])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // Map out the doctor user with extra vet info
        $result = $vets->map(function($vet) {
            return [
                'id' => $vet->id,
                'name' => $vet->user?->firstname .' '. $vet->user?->lastname,
                'avatar' => isset($vet->user?->image_url)
                    ? $vet->user->image_url
                    : (isset($vet->user?->profile_img) ? $vet->user->profile_img : null),
                'city' => $vet->city,
                'total_consultations' => $vet->total_consultations,
            ];
        });

        return $result->toArray();
    }

    public function getRecentActivities()
    {
        $clientId = Auth::user()->client->id;

        $appointments = Appointment::where('client_id', $clientId)
            ->whereIn('status', ['completed', 'cancelled', 'confirmed'])
            ->with(['pet', 'veterinary.user'])
            ->orderBy('appointment_date', 'desc')
            ->orderBy('start_time', 'desc')
            ->limit(10)
            ->get();

        $consultations = Consultation::where('client_id', $clientId)
            ->with(['appointment', 'pet', 'veterinary.user'])
            ->orderBy('conseil_date', 'desc')
            ->orderBy('start_time', 'desc')
            ->limit(10)
            ->get();

        $activities = collect();

        foreach ($appointments as $appointment) {
            $vetName = $appointment->veterinary?->user 
                ? ($appointment->veterinary->user->firstname . ' ' . $appointment->veterinary->user->lastname)
                : __('common.user_dashboard.veterinarian');
            
            $appointmentType = $appointment->appointment_type 
                ? __($appointment->appointment_type)
                : null;
            
            $title = $appointmentType 
                ? $appointmentType . ' ' . __('common.user_dashboard.appointment_with') . ' ' . $vetName
                : __('common.user_dashboard.appointment_with') . ' ' . $vetName;

            $color = match($appointment->status) {
                'completed' => 'bg-emerald-500',
                'cancelled' => 'bg-rose-500',
                'confirmed' => 'bg-blue-500',
                default => 'bg-amber-400',
            };

            $carbonDate = Carbon::parse($appointment->appointment_date);
            
            $dateTime = $carbonDate->copy()->setTimeFromTimeString($appointment->start_time);
            
            $date = $dateTime->toAtomString();

            $activities->push([
                'id' => 'appointment_' . $appointment->id,
                'type' => 'appointment',
                'color' => $color,
                'title' => $title,
                'date' => $date,
                'created_at' => $appointment->created_at,
            ]);
        }

        foreach ($consultations as $consultation) {
            $vetName = $consultation->appointment->veterinary?->user 
                ? ($consultation->appointment->veterinary->user->firstname . ' ' . $consultation->appointment->veterinary->user->lastname)
                : __('common.user_dashboard.veterinarian');
            
            $title = __('common.user_dashboard.consultation_with') . ' ' . $vetName;
            
            if ($consultation->conseil_notes) {
                $notesPreview = substr($consultation->conseil_notes, 0, 50);
                $title = $notesPreview . (strlen($consultation->conseil_notes) > 50 ? '...' : '');
            }

            $color = match($consultation->status ?? 'completed') {
                'completed' => 'bg-emerald-500',
                'cancelled' => 'bg-rose-500',
                default => 'bg-blue-500',
            };

            $carbonDate = Carbon::parse($consultation->conseil_date);
            
            $dateTime = $carbonDate->copy()->setTimeFromTimeString($consultation->start_time);
            
            $date = $dateTime->toAtomString();

            $activities->push([
                'id' => 'consultation_' . $consultation->id,
                'type' => 'consultation',
                'color' => $color,
                'title' => $title,
                'date' => $date,
                'created_at' => $consultation->created_at,
            ]);
        }

        $sortedActivities = $activities->sortByDesc('created_at')->take(10)->values();

        return $sortedActivities->toArray();
    }
}

