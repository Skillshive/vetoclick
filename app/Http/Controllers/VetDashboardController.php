<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Client;
use App\Models\Pet;
use App\Services\AppointmentService;
use App\Http\Resources\AppointmentResource;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class VetDashboardController extends Controller
{
    /**
     * Display the veterinarian dashboard
     */
    public function index(AppointmentService $appointmentService): Response
    {
        $user = Auth::user();
        
        if (!$user || !$user->veterinary) {
            abort(403, __('common.unauthorized'));
        }
        
        // Get all clients for dropdown
        $clients = Client::all()->mapWithKeys(function ($client) {
            return [$client->uuid => $client->first_name];
        });
        
        $veterinaryId = $user->veterinary->id;
        $todayAppointments = $appointmentService->getTodayAppointments($veterinaryId);
        
        // Eager load consultation relationship
        $todayAppointments->load('consultation');
        
        // Calculate statistics
        $statistics = [
            'appointments' => Appointment::where('veterinarian_id', $veterinaryId)->count(),
            'pending' => Appointment::where('veterinarian_id', $veterinaryId)
                ->whereIn('status', ['scheduled', 'confirmed'])
                ->count(),
            'cancelled' => Appointment::where('veterinarian_id', $veterinaryId)
                ->where('status', 'cancelled')
                ->count(),
            'pets' => Pet::whereHas('appointments', function($query) use ($veterinaryId) {
                $query->where('veterinarian_id', $veterinaryId);
            })->distinct()->count(),
            'clients' => Client::whereHas('appointments', function($query) use ($veterinaryId) {
                $query->where('veterinarian_id', $veterinaryId);
            })->distinct()->count(),
            'new_clients' => Client::whereHas('appointments', function($query) use ($veterinaryId) {
                $query->where('veterinarian_id', $veterinaryId);
            })->where('created_at', '>=', now()->subDays(30))
            ->distinct()->count(),
        ];
        
        return Inertia::render('Dashboards/Vet/index')->with([
            "clients" => $clients,
            "todayAppointments" => AppointmentResource::collection($todayAppointments)->toArray(request()),
            "statistics" => $statistics,
        ]);
    }
}
