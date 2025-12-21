<?php

namespace App\Http\Controllers;

use App\Services\ClientService;
use App\Models\Client;
use App\Models\User;
use App\Models\Veterinary;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Exception;
use Illuminate\Validation\ValidationException;

class ClientController extends Controller
{
    protected ClientService $clientService;

    public function __construct(ClientService $clientService)
    {
        $this->clientService = $clientService;
    }

    /**
     * Display listing of clients with pagination
     */
    public function index(Request $request): Response
    {
        $perPage = $request->get('per_page', 10);
        $search = $request->get('search');
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');

        try {
            $query = Client::query();

            // Search functionality
            if ($search) {
                $query->where(function($q) use ($search) {
                    $q->where('first_name', 'LIKE', "%{$search}%")
                      ->orWhere('last_name', 'LIKE', "%{$search}%")
                      ->orWhere('email', 'LIKE', "%{$search}%")
                      ->orWhere('phone', 'LIKE', "%{$search}%");
                });
            }

            // Add pets count
            $query->withCount('pets');

            // Sorting
            $query->orderBy($sortBy, $sortDirection);

            // Paginate
            $clients = $query->paginate($perPage);

            return Inertia::render('Clients/Index', [
                'clients' => [
                    'data' => [
                        'data' => $clients->items(),
                    ],
                    'meta' => [
                        'current_page' => $clients->currentPage(),
                        'from' => $clients->firstItem(),
                        'last_page' => $clients->lastPage(),
                        'per_page' => $clients->perPage(),
                        'to' => $clients->lastItem(),
                        'total' => $clients->total(),
                    ],
                    'links' => [
                        'first' => $clients->url(1),
                        'last' => $clients->url($clients->lastPage()),
                        'prev' => $clients->previousPageUrl(),
                        'next' => $clients->nextPageUrl(),
                    ]
                ],
                'filters' => [
                    'search' => $search,
                    'per_page' => $perPage,
                    'sort_by' => $sortBy,
                    'sort_direction' => $sortDirection,
                ]
            ]);
        } catch (Exception $e) {
            return Inertia::render('Clients/Index', [
                'error' => __('common.error_retrieving_clients'),
                'clients' => [
                    'data' => ['data' => []],
                    'meta' => [
                        'current_page' => 1,
                        'from' => null,
                        'last_page' => 1,
                        'per_page' => $perPage,
                        'to' => null,
                        'total' => 0,
                    ],
                    'links' => [
                        'first' => null,
                        'last' => null,
                        'prev' => null,
                        'next' => null,
                    ]
                ],
                'filters' => [
                    'search' => $search,
                    'per_page' => $perPage,
                    'sort_by' => $sortBy,
                    'sort_direction' => $sortDirection,
                ]
            ]);
        }
    }

    /**
     * Display a listing of the resource.
     *
     * @return JsonResponse
     */
    public function getAll(): JsonResponse
    {
        try {
            $clients = $this->clientService->getAllClients();
            return response()->json($clients);
        } catch (Exception $e) {
            return response()->json(['error' => __('common.error_retrieving_clients')], 500);
        }
    }

    /**
     * Store a newly created client
     *
     * @param Request $request
     * @return JsonResponse|RedirectResponse
     */
    public function store(Request $request): JsonResponse|RedirectResponse
    {
        try {
            $user = Auth::user();
            $hasUserId = $request->has('user_id') || ($user && $request->has('use_current_user'));
            
            $validated = $request->validate([
                'user_id' => 'nullable|exists:users,id',
                'first_name' => $hasUserId ? 'nullable|string|max:255' : 'required|string|max:255',
                'last_name' => $hasUserId ? 'nullable|string|max:255' : 'required|string|max:255',
                'email' => $hasUserId ? 'nullable|email|max:255' : 'required|email|max:255',
                'phone' => $hasUserId ? 'nullable|string|max:20' : 'required|string|max:20',
                'fixe' => 'nullable|string|max:20',
                'address' => 'nullable|string|max:500',
                'city' => 'nullable|string|max:255',
                'postal_code' => 'nullable|string|max:20',
                'veterinarian_id' => 'nullable|string',
            ]);

            $veterinarianId = null;
            if (!empty($validated['veterinarian_id'])) {
                $veterinarian = Veterinary::where('uuid', $validated['veterinarian_id'])->first();
                if ($veterinarian) {
                    $veterinarianId = $veterinarian->id;
                }
            } else {
                $user = Auth::user();
                if ($user && $user->veterinary) {
                    $veterinarianId = $user->veterinary->id;
                }
            }

            if (!$veterinarianId) {
                return response()->json([
                    'error' => __('common.veterinarian_not_found'),
                    'message' => __('common.unable_to_determine_veterinarian_for_this_client')
                ], 400);
            }

            $userId = $validated['user_id'] ?? ($user?->id ?? null);
            if ($userId && !$user) {
                $user = User::find($userId);
            }
            
            $client = Client::create([
                'veterinarian_id' => $veterinarianId,
                'user_id' => $userId,
                'first_name' => $validated['first_name'] ?? ($user?->firstname ?? null),
                'last_name' => $validated['last_name'] ?? ($user?->lastname ?? null),
                'email' => $validated['email'] ?? ($user?->email ?? null),
                'phone' => $validated['phone'] ?? ($user?->phone ?? null),
                'fixe' => $validated['fixe'] ?? null,
                'address' => $validated['address'] ?? null,
                'city' => $validated['city'] ?? null,
                'postal_code' => $validated['postal_code'] ?? null,
            ]);

            if ($request->header('X-Inertia')) {
                return redirect()->route('clients.index')
                    ->with('success', __('common.client_created_successfully'));
            }

            return response()->json([
                'success' => true,
                'message' => __('common.client_created_successfully'),
                'client' => [
                    'uuid' => $client->uuid,
                    'first_name' => $client->first_name,
                    'last_name' => $client->last_name,
                    'email' => $client->email,
                    'phone' => $client->phone,
                ]
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'error' => __('common.validation_failed'),
                'message' => __('common.error'),
                'errors' => __('common.error'),
            ], 422);
        } catch (Exception $e) {
            return response()->json([
                'error' => __('common.failed_to_create_client'),
                'message' => __('common.error_creating_client')
            ], 500);
        }
    }

    /**
     * Store a client for appointment booking (email and phone are optional)
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function storeForAppointment(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $hasUserId = $user !== null;
            
            $validated = $request->validate([
                'first_name' => $hasUserId ? 'nullable|string|max:255' : 'required|string|max:255',
                'last_name' => $hasUserId ? 'nullable|string|max:255' : 'required|string|max:255',
                'email' => 'nullable|email|max:255',
                'phone' => 'nullable|string|max:20',
                'fixe' => 'nullable|string|max:20',
                'address' => 'nullable|string|max:500',
                'city' => 'nullable|string|max:255',
                'postal_code' => 'nullable|string|max:20',
                'veterinarian_id' => 'nullable|string',
            ]);

            // Get current user's veterinarian ID if not provided
            $veterinarianId = null;
            if (!empty($validated['veterinarian_id'])) {
                $veterinarian = Veterinary::where('uuid', $validated['veterinarian_id'])->first();
                if ($veterinarian) {
                    $veterinarianId = $veterinarian->id;
                }
            } else {
                $user = Auth::user();
                if ($user && $user->veterinary) {
                    $veterinarianId = $user->veterinary->id;
                }
            }

            $client = Client::create([
                'veterinarian_id' => $veterinarianId,
                'user_id' => $user?->id ?? null,
                'first_name' => $validated['first_name'] ?? ($user?->firstname ?? null),
                'last_name' => $validated['last_name'] ?? ($user?->lastname ?? null),
                'email' => $validated['email'] ?? ($user?->email ?? null),
                'phone' => $validated['phone'] ?? ($user?->phone ?? null),
                'fixe' => $validated['fixe'] ?? null,
                'address' => $validated['address'] ?? null,
                'city' => $validated['city'] ?? null,
                'postal_code' => $validated['postal_code'] ?? null,
            ]);

            return response()->json([
                'success' => true,
                'message' => __('common.client_created_successfully'),
                'client' => [
                    'uuid' => $client->uuid,
                    'first_name' => $client->first_name,
                    'last_name' => $client->last_name,
                    'email' => $client->email,
                    'phone' => $client->phone,
                ],
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'error' => __('common.validation_error'),
                'message' => __('common.validation_failed'),
                'errors' => __('common.error'),
            ], 422);
        } catch (Exception $e) {
            return response()->json([
                'error' => __('common.client_create_error'),
                'message' =>__('common.error'),
            ], 500);
        }
    }

    /**
     * Update an existing client
     *
     * @param Request $request
     * @param string $uuid
     * @return JsonResponse|RedirectResponse
     */
    public function update(Request $request, string $uuid): JsonResponse|RedirectResponse
    {
        try {
            $client = Client::where('uuid', $uuid)->firstOrFail();

            $hasUserId = $client->user_id !== null;
            
            $validated = $request->validate([
                'veterinarian_id' => 'nullable|string',
                'first_name' => $hasUserId ? 'nullable|string|max:255' : 'required|string|max:255',
                'last_name' => $hasUserId ? 'nullable|string|max:255' : 'required|string|max:255',
                'email' => $hasUserId ? 'nullable|email|max:255' : 'required|email|max:255',
                'phone' => $hasUserId ? 'nullable|string|max:20' : 'required|string|max:20',
                'fixe' => 'nullable|string|max:20',
                'address' => 'nullable|string|max:500',
                'city' => 'nullable|string|max:255',
                'postal_code' => 'nullable|string|max:20',
            ]);

            $veterinarianId = null;
            if (!empty($validated['veterinarian_id'])) {
                $veterinarian = Veterinary::where('uuid', $validated['veterinarian_id'])->first();
                if ($veterinarian) {
                    $veterinarianId = $veterinarian->id;
                }
                unset($validated['veterinarian_id']); 
            }
            
            $user = $client->user;
            $updateData = $validated;
            if ($user) {
                $updateData['first_name'] = $validated['first_name'] ?? $user->firstname;
                $updateData['last_name'] = $validated['last_name'] ?? $user->lastname;
                $updateData['email'] = $validated['email'] ?? $user->email;
                $updateData['phone'] = $validated['phone'] ?? $user->phone;
            }
            
            if ($veterinarianId !== null) {
                $updateData['veterinarian_id'] = $veterinarianId;
            }
            
            $client->update($updateData);

            return redirect()->route('clients.index')
                ->with('success', __('common.client_updated_successfully'));
        } catch (ValidationException $e) {
            if ($request->wantsJson() || $request->expectsJson()) {
                return response()->json([
                    'error' => __('common.validation_failed'),
                    'message' => __('common.error_validating_client'),
                    'errors' => __('common.error'),
                ], 422);
            }
            return back()->withErrors(__('common.error'))->withInput();
        } catch (Exception $e) {
            if ($request->wantsJson() || $request->expectsJson()) {
                return response()->json([
                    'error' => __('common.failed_to_update_client'),
                    'message' => __('common.error_updating_client') 
                ], 500);
            }
            return back()->with('error', __('common.failed_to_update_client'));
        }
    }

    /**
     * Delete a client
     *
     * @param string $uuid
     * @return JsonResponse|RedirectResponse
     */
    public function destroy(Request $request, string $uuid): JsonResponse|RedirectResponse
    {
        try {
            $client = Client::where('uuid', $uuid)->firstOrFail();
            $client->delete();

            if ($request->wantsJson() || $request->expectsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Client deleted successfully'
                ]);
            }

            return redirect()->route('clients.index')
                ->with('success', __('common.client_deleted_successfully'));
        } catch (Exception $e) {
            if ($request->wantsJson() || $request->expectsJson()) {
                return response()->json([
                    'error' => __('common.failed_to_delete_client'),
                    'message' => __('common.error_deleting_client') 
                ], 500);
            }
            return back()->with('error', __('common.failed_to_delete_client') );
        }
    }
}
