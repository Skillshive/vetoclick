<?php

namespace App\Http\Controllers;

use App\common\AppointmentDTO;
use App\Http\Requests\AppointmentRequest;
use App\Services\AppointmentService;
use App\Http\Resources\AppointmentResource;
use App\Models\Client;
use App\Models\Veterinary;
use App\Enums\ConsultationStatus;
use Illuminate\Http\JsonResponse;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AppointmentController extends Controller
{
    protected $appointmentService;

    public function __construct(AppointmentService $appointmentService)
    {
        $this->appointmentService = $appointmentService;
    }


    public function store(AppointmentRequest $request)
    {
        try {
            $dto = AppointmentDTO::fromRequest($request);
            if (!$dto->veterinarian_id) {
                $dto->veterinarian_id = Auth::user()?->veterinary?->uuid;
            }
            $appointment = $this->appointmentService->create($dto);
            if ($request->expectsJson()) {
                return new JsonResponse([
                    'appointment' => new AppointmentResource($appointment),
                    'message' => __('common.appointment_created_success'),
                ], 201);
            }

            return redirect()->route('appointments.index')->with('success', __('common.appointment_created_success'));
        } catch (Exception $e) {
            if ($request->expectsJson()) {
                return new JsonResponse([
                    'error' => $e->getMessage(),
                ], 422);
            }
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function index(Request $request): Response
    {
        try {
            $filters = $request->only(['search', 'per_page', 'sort_by', 'sort_direction', 'status', 'client']);
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
            \Illuminate\Support\Facades\Log::error($e->getMessage());
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
                return response()->json(['error' => __('common.appointment_not_found')]);
            }

            $dto = AppointmentDTO::fromRequest($request);
            if (!$dto->veterinarian_id && $request->user()?->veterinary?->uuid) {
                $dto->veterinarian_id = $request->user()->veterinary->uuid;
            }
            $updatedAppointment = $this->appointmentService->update($uuid, $dto);

            return response()->json([
                "appointment" => $updatedAppointment
            ]);

        } catch (Exception $e) {
            return back()->with('error', __('common.error'));
        }
    }

    public function destroy(string $uuid)
    {
        try {
            $appointment = $this->appointmentService->getByUuid($uuid);

            if (!$appointment) {
                return response()->json(['error' => __('common.appointment_not_found')]);
            }

            $this->appointmentService->delete($uuid);

            return response()->json(['success' => __('common.appointment_deleted_success')]);
        } catch (Exception $e) {
            return response()->json(['error' => __('common.appointment_delete_error')]);
        }
    }

    public function cancel(string $uuid): \Illuminate\Http\RedirectResponse
    {
        try {
            $appointment = $this->appointmentService->getByUuid($uuid);

            if (!$appointment) {
                return redirect()->back()->withErrors(['error' => __('common.appointment_not_found')]);
            }

            $this->appointmentService->cancel($uuid);

            return redirect()->route('appointments.index')->with('success', __('common.appointment_cancelled_successfully'));
        } catch (Exception $e) {
            return redirect()->back()->withErrors(['error' => __('common.failed_to_cancel_appointment')]);
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
}
