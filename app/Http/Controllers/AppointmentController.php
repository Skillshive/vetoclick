<?php

namespace App\Http\Controllers;

use App\common\AppointmentDTO;
use App\Http\Requests\AppointmentRequest;
use App\Services\AppointmentService;
use App\Services\JitsiMeetService;
use App\Http\Resources\AppointmentResource;
use App\Models\Client;
use App\Models\Veterinary;
use App\Models\Consultation;
use App\Models\Appointment;
use App\Enums\ConsultationStatus;
use Illuminate\Http\JsonResponse;
use Exception;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Http\Requests\ClientAppointmentRequest;

class AppointmentController extends Controller
{
    protected $appointmentService;
    protected $jitsiMeetService;

    public function __construct(AppointmentService $appointmentService, JitsiMeetService $jitsiMeetService)
    {
        $this->appointmentService = $appointmentService;
        $this->jitsiMeetService = $jitsiMeetService;
    }


    public function store(AppointmentRequest $request)
    {
        try {
            $dto = AppointmentDTO::fromRequest($request);
            $this->appointmentService->create($dto);
            return redirect()->route('appointments.index')->with('success', __('common.appointment_created_success'));
        } catch (Exception $e) {
            return back()->withErrors(['error' =>  __('common.error')]);
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
     * Validate and redirect to Jitsi Meet meeting
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

            // Redirect to Jitsi Meet
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
            
            return redirect()->back()->with('success', __('common.appointment_accepted_success'));
        } catch (Exception $e) {
            if (request()->wantsJson() || request()->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'error' =>  __('common.error')
                ], 400);
            }
            return back()->withErrors(['error' => __('common.error')]);
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
            $user = auth()->user();
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
            $appointment = Appointment::where('uuid', $uuid)->firstOrFail();

            // Check if appointment can be cancelled
            if ($appointment->status === 'completed' || $appointment->status === 'cancelled') {
                return response()->json([
                    'error' => 'Appointment cannot be cancelled',
                    'message' => 'This appointment is already ' . $appointment->status
                ], 400);
            }

            $appointment->update(['status' => 'cancelled']);

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
}