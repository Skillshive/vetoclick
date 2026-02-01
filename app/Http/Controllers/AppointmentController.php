<?php

namespace App\Http\Controllers;

use App\common\AppointmentDTO;
use App\Http\Requests\AppointmentRequest;
use App\Http\Requests\CreateAppointmentRequest;
use App\Services\AppointmentService;
use App\Services\JitsiMeetService;
use App\Http\Resources\AppointmentResource;
use App\Models\Client;
use App\Models\Veterinary;
use App\Models\Consultation;
use App\Models\Appointment;
use App\Enums\ConsultationStatus;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Exception;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Http\Requests\ClientAppointmentRequest;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class AppointmentController extends Controller
{
    protected $appointmentService;
    protected $jitsiMeetService;

    
    public function __construct(AppointmentService $appointmentService, JitsiMeetService $jitsiMeetService)
    {
        $this->appointmentService = $appointmentService;
        $this->jitsiMeetService = $jitsiMeetService;
    }


    /**
     * Store a new appointment (admin/internal use)
     */
    public function store(AppointmentRequest $request)
    {
        try {
            $dto = AppointmentDTO::fromRequest($request);
            
            // Validate appointment request before creating
            if (!empty($dto->veterinarian_id)) {
                $validation = $this->appointmentService->validateAppointmentRequest(
                    $dto->veterinarian_id,
                    $dto->appointment_date,
                    $dto->start_time
                );
                
                if (!$validation['valid']) {
                    if ($request->wantsJson() || $request->expectsJson()) {
                        return response()->json([
                            'success' => false,
                            'error' => $validation['message'],
                            'message' => $validation['message'],
                            'suggestions' => $validation['suggestions'],
                        ], 422);
                    }
                    return back()
                        ->withErrors(['error' => $validation['message']])
                        ->with('suggestions', $validation['suggestions']);
                }
            }
            
            $appointment = $this->appointmentService->create($dto, true); // Skip validation since we already did it
            
            if ($request->wantsJson() || $request->expectsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => __('common.appointment_created_success'),
                    'appointment' => new AppointmentResource($appointment),
                ], 201);
            }
            
            return redirect()->route('appointments.index')->with('success', __('common.appointment_created_success'));
        } catch (Exception $e) {
            $suggestions = [];
                     
            if ($request->wantsJson() || $request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'error' => __('common.error'),
                    'message' => __('common.error'),
                    'suggestions' => $suggestions,
                ], 400);
            }
            return back()->withErrors([
                'error' => __('common.error'),
                'suggestions' => $suggestions
            ]);
        }
    }

    /**
     * Create appointment from client form (public-facing)
     */
    public function createAppointment(CreateAppointmentRequest $request)
    {
        try {
            $clientId = $request->input('client_id');
            if (!$clientId) {
                $user = Auth::user();
                if ($user && $user->client) {
                    $clientId = $user->client->uuid;
                } else {
                    return back()->withErrors([
                        'client_id' => __('validation.client_id_required')
                    ]);
                }
            }

            $dto = new AppointmentDTO(
                veterinarian_id: $request->input('veterinary_id'),
                client_id: $clientId,
                pet_id: $request->input('pet_id'),
                appointment_type: $request->input('appointment_type'),
                appointment_date: $request->input('appointment_date'),
                start_time: $request->input('start_time'),
                is_video_conseil: $request->input('is_video_conseil') ? '1' : '0',
                reason_for_visit: $request->input('reason_for_visit'),
                appointment_notes: $request->input('appointment_notes'),
            );

            // Validate appointment request before creating
            if (!empty($dto->veterinarian_id)) {
                $validation = $this->appointmentService->validateAppointmentRequest(
                    $dto->veterinarian_id,
                    $dto->appointment_date,
                    $dto->start_time
                );
                
                if (!$validation['valid']) {
                    if ($request->header('X-Inertia')) {
                        return back()
                            ->withErrors(['error' => $validation['message']])
                            ->with('suggestions', $validation['suggestions']);
                    }
                    
                    if ($request->wantsJson() || $request->expectsJson()) {
                        return response()->json([
                            'success' => false,
                            'error' => $validation['message'],
                            'message' => $validation['message'],
                            'suggestions' => $validation['suggestions'],
                        ], 422);
                    }
                    
                    return back()
                        ->withErrors(['error' => $validation['message']])
                        ->with('suggestions', $validation['suggestions']);
                }
            }

            $appointment = $this->appointmentService->create($dto, true); // Skip validation since we already did it
            
            if ($request->header('X-Inertia')) {
                return redirect()->route('appointments.index')->with('success', __('common.appointment_created_success'));
            }
            
            if ($request->wantsJson() || $request->expectsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => __('common.appointment_created_success'),
                    'appointment' => new AppointmentResource($appointment),
                ], 201);
            }
            
            return redirect()->route('appointments.index')->with('success', __('common.appointment_created_success'));
        } catch (Exception $e) {
            // Check if error contains suggestions (format: "message|json_suggestions")
            $errorMessage = $e->getMessage();
            $suggestions = [];
            
            if (strpos($errorMessage, '|') !== false) {
                $parts = explode('|', $errorMessage, 2);
                $errorMessage = $parts[0];
                if (isset($parts[1])) {
                    $suggestions = json_decode($parts[1], true) ?? [];
                }
            }
            
            if ($request->header('X-Inertia')) {
                return back()
                    ->withErrors(['error' => $errorMessage ?: __('common.error')])
                    ->with('suggestions', $suggestions);
            }
            
            if ($request->wantsJson() || $request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'error' => $errorMessage ?: __('common.error'),
                    'message' => $errorMessage ?: __('common.error'),
                    'suggestions' => $suggestions,
                ], 400);
            }
            
            return back()
                ->withErrors(['error' => $errorMessage ?: __('common.error')])
                ->with('suggestions', $suggestions);
        }
    }

    /**
     * Handle client appointment request (requires vet approval)
     */
    public function requestAppointment(ClientAppointmentRequest $request)
    {
        try {
            $dto = AppointmentDTO::fromRequest($request);
            $appointment = $this->appointmentService->requestAppointment($dto);
            
            if ($request->wantsJson() || $request->expectsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => __('common.appointment_requested_success'),
                    'appointment' => new AppointmentResource($appointment)
                ]);
            }
            
            return redirect()->back()->with('success', __('common.appointment_requested_success'));
        } catch (Exception $e) {
            if ($request->wantsJson() || $request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'error' =>  __('common.error')
                ], 400);
            }
            return back()->withErrors(['error' =>  __('common.error')]);
        }
    }

    /**
     * Show the form for creating a new appointment.
     */
    public function create(Request $request): Response
    {
        $vetId = $request->query('vet_id');
        $user = Auth::user();
        $client = $user ? $user->client : null;
        
        $pets = [];
        $userPersonalInfo = null;
        if ($client && $user) {
            $hasCompleteData = !empty($user->firstname) && !empty($user->lastname);
            
            if ($hasCompleteData) {
                $pets = $client->pets()->with(['breed.species'])->get()->map(function ($pet) {
                    return [
                        'uuid' => $pet->uuid,
                        'name' => $pet->name,
                        'breed_id' => $pet->breed?->uuid, 
                        'species_id' => $pet->breed?->species?->uuid, 
                        'breed_name' => $pet->breed?->breed_name,
                        'species_name' => $pet->breed?->species?->name,
                        'sex' => $pet->sex,
                        'neutered_status' => $pet->neutered_status,
                        'dob' => $pet->dob,
                        'microchip_ref' => $pet->microchip_ref,
                        'weight_kg' => $pet->weight_kg,
                        'bcs' => $pet->bcs,
                        'color' => $pet->color,
                        'notes' => $pet->notes,
                        'profile_img' => $pet->profile_img,
                    ];
                })->toArray();
                
                $userPersonalInfo = [
                    'firstname' => $user->firstname ?? '',
                    'lastname' => $user->lastname ?? '',
                    'email' => $user->email ?? '',
                    'phone' => $user->phone ?? '',
                    'address' => $client->address ?? '',
                    'city' => $client->city ?? '',
                    'postal_code' => $client->postal_code ?? '',
                ];
            } else {
                $pets = $client->pets()->with(['breed.species'])->get()->map(function ($pet) {
                    return [
                        'uuid' => $pet->uuid,
                        'name' => $pet->name,
                        'breed_id' => $pet->breed?->uuid, 
                        'species_id' => $pet->breed?->species?->uuid, 
                        'breed_name' => $pet->breed?->breed_name,
                        'species_name' => $pet->breed?->species?->name,
                        'sex' => $pet->sex,
                        'neutered_status' => $pet->neutered_status,
                        'dob' => $pet->dob,
                        'microchip_ref' => $pet->microchip_ref,
                        'weight_kg' => $pet->weight_kg,
                        'bcs' => $pet->bcs,
                        'color' => $pet->color,
                        'notes' => $pet->notes,
                        'profile_img' => $pet->profile_img,
                    ];
                })->toArray();
            }
        }
        
        $veterinarians = Veterinary::with(['user' => function($query) {
            $query->select('id', 'firstname', 'lastname');
        }])
            ->whereHas('user') 
            ->select('veterinarians.id', 'veterinarians.uuid', 'veterinarians.clinic_name', 'veterinarians.user_id')
            ->get()
            ->map(function ($vet) {
                $name = 'Unknown';
                if ($vet->user) {
                    $nameParts = array_filter([$vet->user->firstname ?? '', $vet->user->lastname ?? '']);
                    $name = !empty($nameParts) ? trim(implode(' ', $nameParts)) : 'Unknown';
                }
                return [
                    'id' => $vet->id,
                    'uuid' => $vet->uuid,
                    'name' => $name,
                    'clinic' => $vet->clinic_name ?? '',
                ];
            });
        
        return Inertia::render('Appointments/AppointmentForm', [
            'veterinarians' => $veterinarians,
            'selectedVetId' => $vetId,
            'clientId' => $client ? $client->uuid : null,
            'userPersonalInfo' => $userPersonalInfo,
            'userPets' => $pets,
        ]);
    }

    public function index(Request $request): Response
    {
        try {
            $filters = $request->only(['search', 'per_page', 'sort_by', 'sort_direction', 'status', 'client', 'page']);
            $appointments = $this->appointmentService->getAll($filters);
            
            return Inertia::render('Appointments/Index', [
                'appointments' => [
                    'data' => AppointmentResource::collection($appointments->items())->toArray(request()),
                    'meta' => [
                        'current_page' => $appointments->currentPage(),
                        'from' => $appointments->firstItem(),
                        'last_page' => $appointments->lastPage(),
                        'per_page' => $appointments->perPage(),
                        'to' => $appointments->lastItem(),
                        'total' => $appointments->total(),
                    ],
                    'links' => [
                        'first' => $appointments->url(1),
                        'last' => $appointments->url($appointments->lastPage()),
                        'prev' => $appointments->previousPageUrl(),
                        'next' => $appointments->nextPageUrl(),
                    ]
                ],
                'filters' => $filters,
                'vets' => Veterinary::all(),
                'clients' => Client::all(),
                'statuses' => ConsultationStatus::toArray(),
            ]);
        } catch (Exception $e) {
            return Inertia::render('Appointments/Index', [
                'error' => __('common.error'),
                'appointments' => [
                    'data' => [],
                    'meta' => null,
                    'links' => null
                ],
                'filters' => $filters,
                'vets' => Veterinary::all(),
                'clients' => Client::all(),
                'statuses' => ConsultationStatus::toArray(),
            ]);
        }
    }

    public function show(string $uuid)
    {
        try {
            $appointment = $this->appointmentService->getByUuid($uuid);

            if (!$appointment) {
                return response()->json([
                    'error' => __('common.appointment_not_found')
                ]);
            }

            $appointmentResource = new AppointmentResource($appointment);
             return response()->json([
                    'app$appointment' => $appointment
                ]);
        } catch (Exception $e) {
             return response()->json([
                    'error' => __('common.error')
                ]);
        }
    }

    public function update(AppointmentRequest $request, string $uuid)
    {
        try {
            $appointment = $this->appointmentService->getByUuid($uuid);

            if (!$appointment) {
                return response()->json(['error'=> __('common.appointment_not_found')]);
            }

            $dto = AppointmentDTO::fromRequest($request);
            $updatedAppointment = $this->appointmentService->update($uuid, $dto);

            return response()->json([
                "appointment"=>$updatedAppointment
            ]);

        } catch (Exception $e) {
            return back()->with('error', __('common.error') );
        }
    }

    public function destroy(string $uuid)
    {
        try {
            $appointment = $this->appointmentService->getByUuid($uuid);

            if (!$appointment) {
                return response()->json(['error'=> __('common.appointment_not_found')]);
            }

            $this->appointmentService->delete($uuid);
            
            return response()->json(['success'=> __('common.appointment_deleted_success')]);
        } catch (Exception $e) {
                return response()->json(['error'=> __('common.appointment_delete_error')]);
        }
    }

    public function report(Request $request, string $uuid)
    {
        try {
            $appointment = $this->appointmentService->getByUuid($uuid);

            if (!$appointment) {
                return back()->with('error', __('common.appointment_not_found'));
            }

            $dto = AppointmentDTO::fromRequest($request);
            $this->appointmentService->report($uuid, $dto);
            
            return back()->with('success', __('common.appointment_reported_successfully'));
        } catch (Exception $e) {
            return back()->with('error', __('common.failed_to_report_appointment'));
        }
    }

    /**
     * Validate and redirect to VetoClick Meet meeting
     * Checks if the current time matches the appointment time before allowing access
     */
    public function joinMeeting(string $uuid)
    {
        try {
            $appointment = $this->appointmentService->getByUuid($uuid);

            if (!$appointment) {
                return back()->withErrors(['error' => __('common.appointment_not_found')]);
            }

            // Check if this is a video consultation
            if (!$appointment->is_video_conseil) {
                return back()->withErrors(['error' => __('common.this_appointment_does_not_have_video_consultation_enabled')]);
            }

            // Check if meeting link exists
            if (!$appointment->video_join_url) {
                return back()->withErrors(['error' => __('common.meeting_link_not_available')]);
            }

            // Get appointment date and time
            $appointmentDate = $appointment->appointment_date instanceof \Carbon\Carbon 
                ? $appointment->appointment_date->format('Y-m-d')
                : (is_string($appointment->appointment_date) ? $appointment->appointment_date : \Carbon\Carbon::parse($appointment->appointment_date)->format('Y-m-d'));
            
            // Handle time format (stored as time string H:i:s or H:i)
            $startTime = is_string($appointment->start_time) 
                ? substr($appointment->start_time, 0, 5) // Get HH:MM from HH:MM:SS
                : \Carbon\Carbon::parse($appointment->start_time)->format('H:i');

            // Validate if meeting can be accessed
            $accessCheck = $this->jitsiMeetService->canAccessMeeting($appointmentDate, $startTime);

            if (!$accessCheck['can_access']) {
                return back()->withErrors(['error' => $accessCheck['message']]);
            }

            // Track meeting start and client attendance
            $user = Auth::user();
            $isClient = $user && $user->client && $user->client->id === $appointment->client_id;
            
            if ($isClient && !$appointment->client_attended_meeting) {
                $appointment->update([
                    'client_attended_meeting' => true,
                    'client_joined_at' => now(),
                    'meeting_started_at' => $appointment->meeting_started_at ?? now(),
                ]);
            } elseif (!$appointment->meeting_started_at) {
                // Vet or first person joining - mark meeting as started
                $appointment->update([
                    'meeting_started_at' => now(),
                ]);
            }

            // Auto-create consultation when user joins
            $appointment->refresh();
            $this->autoCreateConsultationOnJoin($appointment);

            // Redirect to VetoClick Meet
            return redirect($appointment->video_join_url);
        } catch (Exception $e) {
            return back()->withErrors(['error' => __('common.failed_to_join_meeting')]);
        }
    }

    /**
     * Accept an appointment request (for vets)
     * Checks availability before accepting
     */
    public function accept(string $uuid)
    {
        try {
            $appointment = $this->appointmentService->acceptAppointment($uuid);
            
            if (request()->wantsJson() || request()->expectsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => __('common.appointment_accepted_success'),
                    'appointment' => new AppointmentResource($appointment)
                ]);
            }
            
            // For Inertia requests, return back with success
            return redirect()->back()->with('success', __('common.appointment_accepted_success'));
        } catch (Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error accepting appointment', [
                'uuid' => $uuid,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            if (request()->wantsJson() || request()->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'error' => $e->getMessage() ?: __('common.error'),
                    'message' => $e->getMessage() ?: __('common.error')
                ], 400);
            }
            return back()->withErrors(['error' => $e->getMessage() ?: __('common.error')]);
        }
    }

    /**
     * Check if meeting can be accessed (API endpoint)
     */
    public function checkMeetingAccess(string $uuid): JsonResponse
    {
        try {
            $appointment = $this->appointmentService->getByUuid($uuid);

            if (!$appointment) {
                return response()->json([
                    'can_access' => false,
                    'message' => __('common.appointment_not_found')
                ], 404);
            }

            if (!$appointment->is_video_conseil) {
                return response()->json([
                    'can_access' => false,
                    'message' => __('common.this_appointment_does_not_have_video_consultation_enabled')
                ], 400);
            }

            // Get appointment date and time
            $appointmentDate = $appointment->appointment_date instanceof \Carbon\Carbon 
                ? $appointment->appointment_date->format('Y-m-d')
                : (is_string($appointment->appointment_date) ? $appointment->appointment_date : \Carbon\Carbon::parse($appointment->appointment_date)->format('Y-m-d'));
            
            // Handle time format (stored as time string H:i:s or H:i)
            $startTime = is_string($appointment->start_time) 
                ? substr($appointment->start_time, 0, 5) // Get HH:MM from HH:MM:SS
                : \Carbon\Carbon::parse($appointment->start_time)->format('H:i');

            $accessCheck = $this->jitsiMeetService->canAccessMeeting($appointmentDate, $startTime);

            return response()->json([
                'can_access' => $accessCheck['can_access'],
                'message' => $accessCheck['message'],
                'video_join_url' => $appointment->video_join_url,
                'appointment_datetime' => $accessCheck['appointment_datetime'] ?? null,
            ]);
        } catch (Exception $e) {
            return response()->json([
                'can_access' => false,
                'message' => __('common.failed_to_check_meeting_access')
            ], 500);
        }
    }

    /**
     * Automatically create consultation when user joins meeting
     */
    private function autoCreateConsultationOnJoin(Appointment $appointment): ?Consultation
    {
        try {
            // Only create consultation if meeting has started
            if (!$appointment->meeting_started_at) {
                return null;
            }

            // Check if consultation already exists
            if ($appointment->consultation) {
                \Illuminate\Support\Facades\Log::info('Consultation already exists', [
                    'appointment_uuid' => $appointment->uuid,
                    'consultation_id' => $appointment->consultation->id
                ]);
                return $appointment->consultation;
            }

            // Get veterinarian_id from appointment
            $veterinarian = $appointment->veterinary ? $appointment->veterinary->id : null;

            // Create consultation from appointment
            $consultation = Consultation::create([
                'veterinarian_id' => $veterinarian,
                'appointment_id' => $appointment->id,
                'client_id' => $appointment->client_id,
                'pet_id' => $appointment->pet_id,
                'conseil_date' => $appointment->appointment_date,
                'start_time' => $appointment->start_time,
                'end_time' => $appointment->end_time,
                'status' => ConsultationStatus::IN_PROGRESS->value,
            ]);

            \Illuminate\Support\Facades\Log::info('Consultation auto-created on join', [
                'appointment_uuid' => $appointment->uuid,
                'consultation_id' => $consultation->id,
                'consultation_uuid' => $consultation->uuid
            ]);

            return $consultation;
        } catch (Exception $e) {
            \Illuminate\Support\Facades\Log::error('Failed to auto-create consultation on join', [
                'appointment_uuid' => $appointment->uuid,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Create consultation from appointment
     */
    public function createConsultation(string $uuid): JsonResponse
    {
        try {
            $appointment = Appointment::where('uuid', $uuid)->firstOrFail();

            // Check if consultation already exists
            if ($appointment->consultation) {
                return response()->json([
                    'success' => true,
                    'message' => __('common.consultation_already_exists'),
                    'consultation_id' => $appointment->consultation->id,
                    'consultation_uuid' => $appointment->consultation->uuid,
                ]);
            }

            // Get veterinarian_id from authenticated user
            $user = Auth::user();
            $veterinarian = null;
            
            if ($user && $user->veterinary) {
                $veterinarian = $user->veterinary->id;
            }

            // Create consultation from appointment
            $consultation = Consultation::create([
                'veterinarian_id' => $veterinarian,
                'appointment_id' => $appointment->id,
                'client_id' => $appointment->client_id,
                'pet_id' => $appointment->pet_id,
                'conseil_date' => $appointment->appointment_date,
                'start_time' => $appointment->start_time,
                'end_time' => $appointment->end_time,
                'status' => ConsultationStatus::IN_PROGRESS->value,
            ]);

            // Update appointment status to completed if needed
            if ($appointment->status !== 'completed') {
                $appointment->update(['status' => 'completed']);
            }

            return response()->json([
                'success' => true,
                'message' => __('common.consultation_created_successfully'),
                'consultation_id' => $consultation->id,
                'consultation_uuid' => $consultation->uuid,
            ]);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Failed to create consultation',
                'message' =>  __('common.error')
            ], 500);
        }
    }

    /**
     * Cancel appointment
     */
    public function cancel(string $uuid): JsonResponse
    {
        try {
            $appointment = $this->appointmentService->getByUuid($uuid);

            if (!$appointment) {
                return response()->json([
                    'error' => 'Appointment not found',
                    'message' => __('common.appointment_not_found')
                ], 404);
            }

            // Check if appointment can be cancelled
            if ($appointment->status === 'completed' || $appointment->status === 'cancelled') {
                return response()->json([
                    'error' => 'Appointment cannot be cancelled',
                    'message' => __('common.this_appointment_is_already') . ' ' . $appointment->status
                ], 400);
            }

            $this->appointmentService->cancel($uuid);

            return response()->json([
                'success' => true,
                'message' => __('common.appointment_cancelled_successfully'),
            ]);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Failed to cancel appointment',
                'message' => __('common.error')
            ], 500);
        }
    }

    /**
     * Get available time suggestions for a veterinarian on a specific date
     */
    public function getAvailableTimes(Request $request): JsonResponse
    {
        try {
            $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
                'veterinary_id' => 'required|string',
                'appointment_date' => 'required|date',
                'duration_minutes' => 'nullable|integer|min:15|max:240',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'error' => __('common.validation_failed'),
                    'errors' => $validator->errors(),
                ], 422);
            }

            $veterinaryId = $request->input('veterinary_id');
            $appointmentDate = $request->input('appointment_date');
            $durationMinutes = $request->input('duration_minutes', 30);

            // Get veterinarian
            $veterinarian = Veterinary::where('uuid', $veterinaryId)->first();
            
            if (!$veterinarian) {
                return response()->json([
                    'success' => false,
                    'error' => __('common.veterinarian_not_found'),
                    'suggestions' => []
                ], 404);
            }

            $suggestions = $this->appointmentService->getAvailableTimeSuggestions(
                $veterinarian->id,
                $appointmentDate,
                $durationMinutes
            );

            return response()->json([
                'success' => true,
                'suggestions' => $suggestions,
                'count' => count($suggestions),
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'error' => __('common.error'),
                'message' => $e->getMessage(),
                'suggestions' => []
            ], 500);
        }
    }

    /**
     * Save video recording URL for an appointment
     * Can be called manually or via webhook
     */
    public function saveRecording(string $uuid, Request $request): JsonResponse
    {
        try {
            $appointment = $this->appointmentService->getByUuid($uuid);

            if (!$appointment) {
                return response()->json([
                    'success' => false,
                    'message' => __('common.appointment_not_found')
                ], 404);
            }

            $validated = $request->validate([
                'recording_url' => 'required|url',
            ]);

            // If recording_url is provided, download and store it locally
            if ($validated['recording_url'] && !empty($validated['recording_url'])) {
                // Dispatch job to download and store the recording
                \App\Jobs\DownloadMeetingRecordingJob::dispatch($uuid);
                
                // Also save the original URL in case download fails
                $appointment->update([
                    'video_recording_url' => $validated['recording_url'],
                ]);
            } else {
                $appointment->update([
                    'video_recording_url' => $validated['recording_url'],
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Recording URL saved successfully',
                'appointment' => new AppointmentResource($appointment)
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to save recording URL'
            ], 500);
        }
    }

    /**
     * Webhook endpoint for Jitsi to notify when recording is ready
     */
    public function jitsiRecordingWebhook(string $uuid, Request $request): JsonResponse
    {
        try {
            $appointment = $this->appointmentService->getByUuid($uuid);

            if (!$appointment) {
                return response()->json([
                    'success' => false,
                    'message' => __('common.appointment_not_found')
                ], 404);
            }

            // Jitsi webhook payload typically contains recording information
            $recordingUrl = $request->input('recording_url') 
                ?? $request->input('recordingUrl')
                ?? $request->input('url');

            if ($recordingUrl) {
                // Dispatch job to download and store the recording
                \App\Jobs\DownloadMeetingRecordingJob::dispatch($uuid);
                
                $appointment->update([
                    'video_recording_url' => $recordingUrl,
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Recording webhook processed successfully'
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'No recording URL provided in webhook'
            ], 400);

        } catch (Exception $e) {
            \Illuminate\Support\Facades\Log::error('Jitsi recording webhook error', [
                'uuid' => $uuid,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to process recording webhook'
            ], 500);
        }
    }

    /**
     * Track meeting start and attendance
     */
    public function trackMeetingStart(string $uuid): JsonResponse
    {
        try {
            \Illuminate\Support\Facades\Log::info('trackMeetingStart called', ['uuid' => $uuid]);
            
            $appointment = $this->appointmentService->getByUuid($uuid);

            if (!$appointment) {
                \Illuminate\Support\Facades\Log::error('Appointment not found in trackMeetingStart', ['uuid' => $uuid]);
                return response()->json([
                    'success' => false,
                    'message' => __('common.appointment_not_found')
                ], 404);
            }

            $user = Auth::user();
            $isClient = $user && $user->client && $user->client->id === $appointment->client_id;
            
            $updates = [];
            
            // Always mark meeting as started when someone joins (vet or client)
            // If already started, this ensures we have a timestamp of when it actually started
            if (!$appointment->meeting_started_at) {
                $updates['meeting_started_at'] = now();
                \Illuminate\Support\Facades\Log::info('Setting meeting_started_at', ['uuid' => $uuid, 'time' => now()]);
            }
            
            // Track client attendance
            if ($isClient && !$appointment->client_attended_meeting) {
                $updates['client_attended_meeting'] = true;
                $updates['client_joined_at'] = now();
                \Illuminate\Support\Facades\Log::info('Client attendance tracked', ['uuid' => $uuid]);
            } elseif (!$isClient && $user) {
                // Vet or other user joining - ensure meeting_started_at is set
                if (!$appointment->meeting_started_at) {
                    $updates['meeting_started_at'] = now();
                }
                \Illuminate\Support\Facades\Log::info('Vet/user joining meeting', [
                    'uuid' => $uuid, 
                    'user_id' => $user->id,
                    'is_vet' => $user->veterinary ? true : false
                ]);
            }
            
            if (!empty($updates)) {
                $result = $appointment->update($updates);
                $appointment->refresh(); // Refresh to get updated values
                \Illuminate\Support\Facades\Log::info('Appointment updated', [
                    'uuid' => $uuid, 
                    'updates' => $updates,
                    'update_result' => $result,
                    'meeting_started_at' => $appointment->meeting_started_at,
                    'client_attended_meeting' => $appointment->client_attended_meeting,
                    'client_joined_at' => $appointment->client_joined_at
                ]);
                
                // Auto-create consultation when user joins
                $this->autoCreateConsultationOnJoin($appointment);
                
                // Schedule recording download jobs based on appointment end time (fallback if endMeetingOnLeave isn't called)
                // Only schedule if meeting just started (first time)
                if (isset($updates['meeting_started_at']) && !$appointment->video_recording_url) {
                    try {
                        // Calculate when the meeting should end
                        $appointmentDate = \Carbon\Carbon::parse($appointment->appointment_date);
                        $endTime = \Carbon\Carbon::createFromFormat('H:i:s', $appointment->end_time);
                        $appointmentEndDateTime = $appointmentDate->copy()
                            ->setTime($endTime->hour, $endTime->minute, $endTime->second);
                        
                        // Schedule jobs: 2, 5, and 10 minutes after appointment end time
                        $delay1 = now()->diffInSeconds($appointmentEndDateTime->copy()->addMinutes(2), false);
                        $delay2 = now()->diffInSeconds($appointmentEndDateTime->copy()->addMinutes(5), false);
                        $delay3 = now()->diffInSeconds($appointmentEndDateTime->copy()->addMinutes(10), false);
                        
                        // Only schedule if the delay is positive (future time)
                        if ($delay1 > 0) {
                            \App\Jobs\DownloadMeetingRecordingJob::dispatch($uuid)->delay(now()->addSeconds($delay1));
                        }
                        if ($delay2 > 0) {
                            \App\Jobs\DownloadMeetingRecordingJob::dispatch($uuid)->delay(now()->addSeconds($delay2));
                        }
                        if ($delay3 > 0) {
                            \App\Jobs\DownloadMeetingRecordingJob::dispatch($uuid)->delay(now()->addSeconds($delay3));
                        }
                        
                        \Illuminate\Support\Facades\Log::info('Recording download jobs scheduled (fallback)', [
                            'uuid' => $uuid,
                            'appointment_end' => $appointmentEndDateTime,
                            'delays' => [$delay1, $delay2, $delay3]
                        ]);
                    } catch (Exception $e) {
                        \Illuminate\Support\Facades\Log::error('Failed to schedule recording jobs (fallback)', [
                            'uuid' => $uuid,
                            'error' => $e->getMessage()
                        ]);
                    }
                }
            } else {
                \Illuminate\Support\Facades\Log::info('No updates needed', ['uuid' => $uuid]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Meeting start tracked',
                'updates' => $updates,
                'appointment' => new AppointmentResource($appointment->fresh())
            ]);
        } catch (Exception $e) {
            \Illuminate\Support\Facades\Log::error('trackMeetingStart error', [
                'uuid' => $uuid,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to track meeting start: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Track meeting end
     */
    public function endMeeting(string $uuid): JsonResponse
    {
        try {
            $appointment = $this->appointmentService->getByUuid($uuid);

            if (!$appointment) {
                return response()->json([
                    'success' => false,
                    'message' => __('common.appointment_not_found')
                ], 404);
            }

            $appointment->update([
                'meeting_ended_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Meeting end time recorded',
                'appointment' => new AppointmentResource($appointment)
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to record meeting end time'
            ], 500);
        }
    }

    /**
     * Track meeting end when user leaves (called from Jitsi redirect)
     */
    public function endMeetingOnLeave(string $uuid, Request $request)
    {
        try {
            \Illuminate\Support\Facades\Log::info('endMeetingOnLeave called', [
                'uuid' => $uuid,
                'user' => Auth::id(),
                'redirect' => $request->get('redirect')
            ]);
            
            $appointment = $this->appointmentService->getByUuid($uuid);

            if (!$appointment) {
                \Illuminate\Support\Facades\Log::error('Appointment not found in endMeetingOnLeave', ['uuid' => $uuid]);
                // If appointment not found, just redirect
                $redirectUrl = $request->get('redirect', url('/dashboard'));
                return redirect($redirectUrl);
            }

            // Always update meeting_ended_at when someone leaves (update if already set to track last person leaving)
            $wasAlreadySet = $appointment->meeting_ended_at ? true : false;
            
            $result = $appointment->update([
                'meeting_ended_at' => now(),
            ]);
            
            $appointment->refresh(); // Refresh to get updated values
            
            \Illuminate\Support\Facades\Log::info('Meeting end time set', [
                'uuid' => $uuid,
                'update_result' => $result,
                'meeting_ended_at' => $appointment->meeting_ended_at,
                'was_already_set' => $wasAlreadySet,
                'meeting_started_at' => $appointment->meeting_started_at,
                'client_attended' => $appointment->client_attended_meeting
            ]);
            
            // Schedule jobs to check for recording after meeting ends (only if not already scheduled)
            if (!$wasAlreadySet) {
                try {
                    \App\Jobs\DownloadMeetingRecordingJob::dispatch($uuid)->delay(now()->addMinutes(2));
                    \App\Jobs\DownloadMeetingRecordingJob::dispatch($uuid)->delay(now()->addMinutes(5));
                    \App\Jobs\DownloadMeetingRecordingJob::dispatch($uuid)->delay(now()->addMinutes(10));
                    \Illuminate\Support\Facades\Log::info('Recording download jobs scheduled', ['uuid' => $uuid]);
                } catch (Exception $e) {
                    \Illuminate\Support\Facades\Log::error('Failed to schedule recording jobs', [
                        'uuid' => $uuid,
                        'error' => $e->getMessage()
                    ]);
                }
            }

            // Redirect to the specified URL or dashboard
            $redirectUrl = $request->get('redirect', url('/dashboard'));
            return redirect($redirectUrl);
        } catch (Exception $e) {
            \Illuminate\Support\Facades\Log::error('endMeetingOnLeave error', [
                'uuid' => $uuid,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            // On error, still redirect to prevent user being stuck
            $redirectUrl = $request->get('redirect', url('/dashboard'));
            return redirect($redirectUrl);
        }
    }

    /**
     * Get appointments for calendar view (filtered by veterinarian)
     */
    public function calendar(Request $request): Response|JsonResponse|RedirectResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                if ($request->wantsJson() || $request->expectsJson()) {
                    return response()->json(['error' => __('common.unauthorized')], 401);
                }
                return redirect()->route('login');
            }

            if (!$user->veterinary) {
                if ($request->wantsJson() || $request->expectsJson()) {
                    return response()->json(['error' => __('common.veterinary_profile_not_found')], 404);
                }
                return redirect()->route('dashboard')->with('error', __('common.veterinary_profile_not_found'));
            }

            $veterinarianId = $user->veterinary->id;
            
            // Get date range from request or default to current month
            $startDate = $request->input('start', Carbon::now()->startOfMonth()->toDateString());
            $endDate = $request->input('end', Carbon::now()->endOfMonth()->toDateString());

            // Fetch appointments for the veterinarian within the date range
            $appointments = Appointment::where('veterinarian_id', $veterinarianId)
                ->whereBetween('appointment_date', [$startDate, $endDate])
                ->with(['client', 'pet.breed.species', 'consultation'])
                ->orderBy('appointment_date', 'asc')
                ->orderBy('start_time', 'asc')
                ->get();

            // Format appointments for FullCalendar
            $events = $appointments->map(function ($appointment) {
                $date = Carbon::parse($appointment->appointment_date);
                $startTime = Carbon::parse($appointment->start_time);
                $endTime = Carbon::parse($appointment->end_time);
                
                // Combine date and time
                $start = $date->copy()->setTimeFromTimeString($appointment->start_time);
                $end = $date->copy()->setTimeFromTimeString($appointment->end_time);

                // Determine color based on status
                // Colors will be processed in frontend to use CSS variables
                $color = match($appointment->status) {
                    'scheduled', 'confirmed' => 'primary-500', // Will be converted to CSS variable in frontend
                    'completed' => 'primary', // Will be converted to CSS variable in frontend
                    'cancelled', 'canceled' => '#ef4444',
                    'pending' => '#f59e0b',
                    default => '#6b7280',
                };

                return [
                    'id' => $appointment->uuid,
                    'title' => $appointment->pet ? $appointment->pet->name : 'Unknown Pet',
                    'start' => $start->toIso8601String(),
                    'end' => $end->toIso8601String(),
                    'backgroundColor' => $color,
                    'borderColor' => $color,
                    'textColor' => '#ffffff',
                    'extendedProps' => [
                        'appointment_type' => $appointment->appointment_type,
                        'reason' => $appointment->reason_for_visit,
                        'appointment_notes' => $appointment->appointment_notes,
                        'status' => $appointment->status,
                        'is_video' => $appointment->is_video_conseil,
                        'duration_minutes' => $appointment->duration_minutes ?: null,
                        'video_meeting_id' => $appointment->video_meeting_id,
                        'video_join_url' => $appointment->video_join_url,
                        'appointment_date' => $appointment->appointment_date,
                        'start_time' => $appointment->start_time,
                        'end_time' => $appointment->end_time,
                        'client' => $appointment->client ? [
                            'name' => $appointment->client->first_name . ' ' . $appointment->client->last_name,
                            'first_name' => $appointment->client->first_name,
                            'last_name' => $appointment->client->last_name,
                            'uuid' => $appointment->client->uuid,
                        ] : null,
                        'pet' => $appointment->pet ? [
                            'name' => $appointment->pet->name,
                            'uuid' => $appointment->pet->uuid,
                            'breed' => $appointment->pet->breed?->breed_name,
                            'species' => $appointment->pet->breed?->species?->name,
                            'microchip' => $appointment->pet->microchip_ref,
                            'color' => $appointment->pet->color,
                            'weight_kg' => $appointment->pet->weight_kg ?: null,
                            'dob' => $appointment->pet->dob,
                        ] : null,
                        'consultation' => $appointment->consultation ? [
                            'uuid' => $appointment->consultation->uuid,
                            'status' => $appointment->consultation->status,
                        ] : null,
                    ],
                ];
            });

            if ($request->wantsJson() || $request->expectsJson()) {
                return response()->json([
                    'events' => $events,
                ]);
            }

            return Inertia::render('Dashboards/Vet/Calendar', [
                'events' => $events,
            ]);
        } catch (Exception $e) {
            if ($request->wantsJson() || $request->expectsJson()) {
                return response()->json([
                    'error' => __('common.error'),
                    'message' => __('common.error')
                ], 500);
            }
            return Inertia::render('Dashboards/Vet/Calendar', [
                'events' => [],
                'error' => __('common.error'),
            ]);
        }
    }
}