<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Veterinary;
use App\Services\ClientService;
use App\Http\Resources\AppointmentResource;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class ReceptionistDashboardController extends Controller
{
    /**
     * @var ClientService
     */
    protected ClientService $clientService;

    public function __construct(ClientService $clientService)
    {
        $this->clientService = $clientService;
    }

    /**
     * Display the receptionist dashboard
     */
    public function index(): Response
    {
        // Get all today's appointments (exclude scheduled status - those are in pending requests)
        $todayAppointments = Appointment::whereDate('appointment_date', Carbon::today())
            ->where('status', '!=', 'scheduled')
            ->with(['client', 'pet.breed.species', 'veterinary.user', 'consultation'])
            ->orderBy('start_time', 'asc')
            ->get();

        // Get pending appointment requests (scheduled status means waiting for vet approval)
        $pendingAppointments = Appointment::where('status', 'scheduled')
            ->where('appointment_date', '>=', Carbon::today())
            ->with(['client', 'pet.breed.species', 'veterinary.user'])
            ->orderBy('appointment_date', 'asc')
            ->orderBy('start_time', 'asc')
            ->limit(10)
            ->get();

        // Calculate statistics
        $stats = [
            'todayTotal' => Appointment::whereDate('appointment_date', Carbon::today())
                ->whereNotIn('status', ['cancelled'])
                ->count(),
            'pendingRequests' => Appointment::where('status', 'scheduled')
                ->where('appointment_date', '>=', Carbon::today())
                ->count(),
            'completedToday' => Appointment::whereDate('appointment_date', Carbon::today())
                ->where('status', 'completed')
                ->count(),
            'cancelledToday' => Appointment::whereDate('appointment_date', Carbon::today())
                ->where('status', 'cancelled')
                ->count(),
        ];

        // Get all clients for the quick schedule form, limited to the veterinarian
        // that the current user (receptionist or vet) is associated with.
        //
        // This reuses the business logic encapsulated in ClientService::getAllClients(),
        // which already scopes clients based on the authenticated user's veterinary
        // relationships and related consultations/appointments.
        $clientModels = $this->clientService->getAllClients();

        $clients = $clientModels
            ->sortBy('first_name')
            ->mapWithKeys(function ($client) {
                return [$client->uuid => trim(($client->first_name ?? '') . ' ' . ($client->last_name ?? ''))];
            });

        // Get all veterinarians for the quick schedule form
        $veterinarians = Veterinary::with('user')
            ->get()
            ->map(function ($vet) {
                return [
                    'uuid' => $vet->uuid,
                    'name' => ($vet->user->firstname ?? '') . ' ' . ($vet->user->lastname ?? ''),
                ];
            })
            ->filter(function ($vet) {
                return !empty(trim($vet['name']));
            })
            ->values();

        // Get the veterinary ID for the current user (receptionist or vet)
        $user = Auth::user();
        $veterinary = $user?->scopedVeterinary();
        $veterinaryId = $veterinary?->uuid ?? null;

        return Inertia::render('Dashboards/Receptionist/index', [
            'todayAppointments' => AppointmentResource::collection($todayAppointments)->toArray(request()),
            'pendingAppointments' => AppointmentResource::collection($pendingAppointments)->toArray(request()),
            'stats' => $stats,
            'clients' => $clients,
            'veterinarians' => $veterinarians,
            'veterinaryId' => $veterinaryId,
        ]);
    }
}

