<?php

namespace App\Http\Controllers;

use App\Http\Requests\PetRequest;
use App\Services\PetService;
use App\Models\Pet;
use App\Models\Client;
use App\Models\Appointment;
use App\Models\Consultation;
use App\Models\Vaccination;
use App\Models\Allergy;
use App\Models\Prescription;
use App\Models\Note;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class PetController extends Controller
{
    protected PetService $petService;

    public function __construct(PetService $petService)
    {
        $this->petService = $petService;
    }

    /**
     * Display a listing of pets
     */
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 15);
        $search = $request->get('search');
        $filters = $request->only(['search', 'client_id', 'species_id']);

        try {
            // Get authenticated user's client
            $user = Auth::user();
            $client = $user->client;
            
            if (!$client) {
                // If user doesn't have a client, return empty results
                $emptyPets = new \Illuminate\Pagination\LengthAwarePaginator([], 0, $perPage);
                
                if ($request->wantsJson() || $request->expectsJson()) {
                    return response()->json([
                        'data' => [],
                        'meta' => [
                            'current_page' => 1,
                            'last_page' => 1,
                            'per_page' => $perPage,
                            'total' => 0,
                        ]
                    ]);
                }

                return Inertia::render('Pets/Index', [
                    'pets' => [
                        'data' => [],
                        'meta' => [
                            'current_page' => 1,
                            'last_page' => 1,
                            'per_page' => $perPage,
                            'total' => 0,
                        ]
                    ],
                    'filters' => $filters
                ]);
            }

            // Get pets with search if provided, filtered by client
            if ($search) {
                $pets = $this->petService->searchByNameForClient($search, $client->id, $perPage);
            } else {
                $pets = $this->petService->getByClientId($client->id, $perPage);
            }

            if ($request->wantsJson() || $request->expectsJson()) {
                // Format for JSON response
                $formattedPets = $pets->map(function ($pet) {
                    return [
                        'uuid' => $pet->uuid,
                        'name' => $pet->name,
                        'profile_img' => $pet->profile_img,
                        'breed' => $pet->breed ? [
                            'uuid' => $pet->breed->uuid,
                            'name' => $pet->breed->breed_name ?? $pet->breed->name,
                        ] : null,
                        'client' => $pet->client ? [
                            'uuid' => $pet->client->uuid,
                            'first_name' => $pet->client->first_name,
                            'last_name' => $pet->client->last_name,
                        ] : null,
                        'sex' => $pet->sex,
                        'dob' => $pet->dob,
                        'color' => $pet->color,
                        'weight_kg' => $pet->weight_kg,
                        'created_at' => $pet->created_at?->toDateTimeString(),
                    ];
                });

                return response()->json([
                    'data' => $formattedPets,
                    'meta' => [
                        'current_page' => $pets->currentPage(),
                        'last_page' => $pets->lastPage(),
                        'per_page' => $pets->perPage(),
                        'total' => $pets->total(),
                    ]
                ]);
            }

            // Format pets data for frontend
            $formattedPets = $pets->map(function ($pet) {
                return [
                    'uuid' => $pet->uuid,
                    'name' => $pet->name,
                    'profile_img' => $pet->profile_img,
                    'breed' => $pet->breed ? [
                        'uuid' => $pet->breed->uuid,
                        'name' => $pet->breed->breed_name ?? $pet->breed->name,
                    ] : null,
                    'client' => $pet->client ? [
                        'uuid' => $pet->client->uuid,
                        'first_name' => $pet->client->first_name,
                        'last_name' => $pet->client->last_name,
                    ] : null,
                    'sex' => $pet->sex,
                    'dob' => $pet->dob,
                    'color' => $pet->color,
                    'weight_kg' => $pet->weight_kg,
                    'created_at' => $pet->created_at?->toDateTimeString(),
                ];
            });

            return Inertia::render('Pets/Index', [
                'pets' => [
                    'data' => $formattedPets,
                    'meta' => [
                        'current_page' => $pets->currentPage(),
                        'last_page' => $pets->lastPage(),
                        'per_page' => $pets->perPage(),
                        'total' => $pets->total(),
                    ]
                ],
                'filters' => $filters
            ]);
        } catch (Exception $e) {
            if ($request->wantsJson() || $request->expectsJson()) {
                return response()->json(['error' => 'Error retrieving pets: ' . $e->getMessage()], 500);
            }
            return redirect()->back()->with('error', 'Error retrieving pets: ' . $e->getMessage());
        }
    }

    /**
     * Show the form for creating a new pet
     */
    public function create(): Response
    {
        $user = Auth::user();
        $client = $user->client;
        
        $clients = Client::all()->map(function ($client) {
            return [
                'uuid' => $client->uuid,
                'first_name' => $client->first_name,
                'last_name' => $client->last_name,
            ];
        });

        return Inertia::render('Pets/Create', [
            'clients' => $clients,
            'defaultClientId' => $client?->uuid,
        ]);
    }

    /**
     * Store a newly created pet in storage
     */
    public function store(PetRequest $request)
    {
       // dd($request->all());
        try {
            $validated = $request->validated();
//dd($validated);
            // Handle profile image upload
            if ($request->hasFile('profile_img')) {
                $image = $request->file('profile_img');
                $path = $image->store('pets', 'public');
                $validated['profile_img'] = $path;
            }

            // Get client_id from request if provided (for receptionist), otherwise from authenticated user
            $clientId = null;
            $client = null;
            
            if (!empty($validated['client_id'])) {
                // Client ID provided in request (already converted from UUID by PetRequest)
                $clientId = $validated['client_id'];
                $client = Client::find($clientId);
                if (!$client) {
                    if ($request->wantsJson() || $request->expectsJson()) {
                        return response()->json(['error' => 'Client not found.'], 404);
                    }
                    return back()->withInput()
                        ->withErrors(['error' => 'Client not found.']);
                }
            } else {
                // Get client from authenticated user
                $user = Auth::user();
                
                if (!$user) {
                    if ($request->wantsJson() || $request->expectsJson()) {
                        return response()->json(['error' => 'User not authenticated.'], 401);
                    }
                    return back()->withInput()
                        ->withErrors(['error' => 'User not authenticated.']);
                }

                // Load client relationship
                $client = $user->load('client')->client;
                
                if (!$client) {
                    // Log for debugging
                    Log::warning('User does not have a client record', [
                        'user_id' => $user->id,
                        'user_email' => $user->email,
                    ]);
                    
                    if ($request->wantsJson() || $request->expectsJson()) {
                        return response()->json([
                            'error' => 'User does not have a client record. Please create a client profile first.',
                            'message' => 'Your account needs to be linked to a client profile before creating pets.'
                        ], 422);
                    }
                    return back()->withInput()
                        ->withErrors(['error' => 'User does not have a client record. Please create a client profile first.']);
                }
                
                $clientId = $client->id;
            }

            // Prepare pet data
            $petData = [
                'client_id' => $clientId,
                'name' => $validated['name'],
                'breed_id' => $validated['breed_id'],
                'sex' => $validated['sex'] ?? 0,
                'neutered_status' => $validated['neutered_status'] ?? false,
                'dob' => $validated['dob'],
                'microchip_ref' => $validated['microchip_ref'] ?? null,
                'profile_img' => $validated['profile_img'] ?? null,
                'weight_kg' => $validated['weight_kg'] ?? null,
                'bcs' => $validated['bcs'] ?? null,
                'color' => $validated['color'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'deceased_at' => $validated['deceased_at'] ?? null,
            ];

            Log::info('Creating pet', [
                'pet_data' => $petData,
                'client_id' => $clientId,
            ]);

            $pet = Pet::create($petData);

            $pet->load(['client', 'breed']);

            if ($request->wantsJson() || $request->expectsJson()) {
                return response()->json([
                    'message' => 'Pet created successfully.',
                    'pet' => [
                        'uuid' => $pet->uuid,
                        'name' => $pet->name,
                        'client_id' => $pet->client_id,
                        'breed_id' => $pet->breed_id,
                        'sex' => $pet->sex,
                        'neutered_status' => $pet->neutered_status,
                        'dob' => $pet->dob,
                        'microchip_ref' => $pet->microchip_ref,
                        'profile_img' => $pet->profile_img,
                        'weight_kg' => $pet->weight_kg,
                        'bcs' => $pet->bcs,
                        'color' => $pet->color,
                        'notes' => $pet->notes,
                        'deceased_at' => $pet->deceased_at,
                        'client' => $pet->client ? [
                            'uuid' => $pet->client->uuid,
                            'first_name' => $pet->client->first_name,
                            'last_name' => $pet->client->last_name,
                        ] : null,
                        'breed' => $pet->breed ? [
                            'uuid' => $pet->breed->uuid,
                            'name' => $pet->breed->breed_name,
                        ] : null,
                    ]
                ], 201);
            }
            
            return redirect()->route('pets.index')
                ->with('success', 'Pet created successfully.');
        } catch (\Illuminate\Database\QueryException $e) {
            Log::error('Database error creating pet', [
                'error' => $e->getMessage(),
                'code' => $e->getCode(),
                'sql' => $e->getSql(),
            ]);
            
            $errorMessage = 'Database error: ' . $e->getMessage();
            if (str_contains($e->getMessage(), 'foreign key constraint')) {
                $errorMessage = 'Invalid breed or client. Please check your selections.';
            }
            
            if ($request->wantsJson() || $request->expectsJson()) {
                return response()->json(['error' => $errorMessage], 422);
            }
            return back()->withInput()
                ->withErrors(['error' => $errorMessage]);
        } catch (Exception $e) {
            Log::error('Error creating pet', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            
            if ($request->wantsJson() || $request->expectsJson()) {
                return response()->json(['error' => 'Error creating pet: ' . $e->getMessage()], 422);
            }
            return back()->withInput()
                ->withErrors(['error' => 'Error creating pet: ' . $e->getMessage()]);
        }
    }

    /**
     * Display the specified pet
     */
    public function show(Request $request, string $uuid): Response|JsonResponse|RedirectResponse
    {
        try {
            $pet = $this->petService->getByUuid($uuid);
            
            if (!$pet) {
                if ($request->wantsJson() || $request->expectsJson()) {
                    return response()->json(['error' => 'Pet not found.'], 404);
                }
                return redirect()->route('pets.index')
                    ->with('error', 'Pet not found.');
            }

            $pet->load(['client', 'breed.species']);

            // Format pet data for frontend
            $formattedPet = [
                'uuid' => $pet->uuid,
                'name' => $pet->name,
                'client_id' => $pet->client_id,
                'breed_id' => $pet->breed_id,
                'sex' => $pet->sex,
                'neutered_status' => $pet->neutered_status,
                'dob' => $pet->dob,
                'microchip_ref' => $pet->microchip_ref,
                'profile_img' => $pet->profile_img,
                'weight_kg' => $pet->weight_kg,
                'bcs' => $pet->bcs,
                'color' => $pet->color,
                'notes' => $pet->notes,
                'deceased_at' => $pet->deceased_at,
                'client' => $pet->client ? [
                    'uuid' => $pet->client->uuid,
                    'first_name' => $pet->client->first_name,
                    'last_name' => $pet->client->last_name,
                ] : null,
                'breed' => $pet->breed ? [
                    'uuid' => $pet->breed->uuid,
                    'name' => $pet->breed->breed_name ?? $pet->breed->name,
                    'species' => $pet->breed->species ? [
                        'uuid' => $pet->breed->species->uuid,
                        'name' => $pet->breed->species->name,
                    ] : null,
                ] : null,
            ];

            // Get medical history
            $medicalHistory = $this->getPetMedicalHistory($pet);

            if ($request->wantsJson() || $request->expectsJson()) {
                return response()->json([
                    'pet' => $formattedPet,
                    'consultations' => $medicalHistory['consultations'],
                    'vaccinations' => $medicalHistory['vaccinations'],
                    'allergies' => $medicalHistory['allergies'],
                ]);
            }

            return Inertia::render('Pets/Show', [
                'pet' => $formattedPet,
                'consultations' => $medicalHistory['consultations'],
                'vaccinations' => $medicalHistory['vaccinations'],
                'allergies' => $medicalHistory['allergies'],
            ]);
        } catch (Exception $e) {
            if ($request->wantsJson() || $request->expectsJson()) {
                return response()->json(['error' => 'Error retrieving pet: ' . $e->getMessage()], 500);
            }
            return redirect()->route('pets.index')
                ->with('error', 'Error retrieving pet: ' . $e->getMessage());
        }
    }

    /**
     * Get pet medical history (helper method)
     * For clients: shows all medical history
     * For veterinarians: shows only their records
     */
    private function getPetMedicalHistory(Pet $pet): array
    {
        // Get current logged-in user
        $user = Auth::user();
        $veterinarianId = null;
        
        // Only filter by veterinarian if user is a veterinarian
        // Clients should see all medical history for their pets
        if ($user && $user->veterinary) {
            $veterinarianId = $user->veterinary->id;
        }

        // Get appointments/consultations
        $consultationsQuery = Appointment::where('pet_id', $pet->id)
            ->with(['veterinary.user', 'consultation.medicalRecords'])
            ->orderBy('appointment_date', 'desc');
        
        // Filter by current veterinarian if available (for vet view)
        if ($veterinarianId) {
            $consultationsQuery->where('veterinarian_id', $veterinarianId);
        }

        $consultations = $consultationsQuery->get()
            ->map(function ($appointment) {
                $hasConsultation = $appointment->consultation !== null;
                $isCanceled = $appointment->status === 'canceled' || $appointment->status === 'cancelled';
                
                return [
                    'uuid' => $appointment->uuid,
                    'date' => $appointment->appointment_date,
                    'appointment_type' => $appointment->appointment_type,
                    'reason' => $appointment->reason_for_visit,
                    'notes' => $appointment->appointment_notes,
                    'status' => $appointment->status,
                    'is_video_conseil' => $appointment->is_video_conseil,
                    'has_consultation' => $hasConsultation,
                    'is_canceled' => $isCanceled,
                    'consultation_uuid' => $hasConsultation ? $appointment->consultation->uuid : null,
                    'medical_record' => $hasConsultation && $appointment->consultation->medicalRecords->isNotEmpty() ? 
                        $appointment->consultation->medicalRecords->first() : 
                        null,
                ];
            });

        // Get vaccinations
        $vaccinationsQuery = Vaccination::whereHas('consultation', function ($query) use ($pet, $veterinarianId) {
                $query->where('pet_id', $pet->id);
                // Filter by current veterinarian if available
                if ($veterinarianId) {
                    $query->where('veterinarian_id', $veterinarianId);
                }
            })
            ->with(['consultation', 'vaccine', 'administeredByUser'])
            ->orderBy('vaccination_date', 'desc');
        
        $vaccinations = $vaccinationsQuery->get()
            ->map(function ($vaccination) {
                return [
                    'uuid' => $vaccination->uuid,
                    'vaccine_name' => $vaccination->vaccine ? $vaccination->vaccine->name : 'Unknown',
                    'vaccination_date' => $vaccination->vaccination_date,
                    'next_due_date' => $vaccination->next_due_date,
                    'status' => $vaccination->next_due_date && now()->gt($vaccination->next_due_date) ? 'overdue' : 'active',
                    'administered_by' => $vaccination->administeredByUser ? 
                        ($vaccination->administeredByUser->firstname . ' ' . $vaccination->administeredByUser->lastname) : 
                        'Unknown',
                ];
            });

        // Get allergies
        $allergiesQuery = Allergy::where('pet_id', $pet->id)
            ->with(['veterinarian.user'])
            ->orderBy('created_at', 'desc');
        
        // Filter by current veterinarian if available
        if ($veterinarianId) {
            $allergiesQuery->where('veterinarian_id', $veterinarianId);
        }
        
        $allergies = $allergiesQuery->get()
            ->map(function ($allergy) {
                return [
                    'uuid' => $allergy->uuid,
                    'allergen_type' => $allergy->allergen_type,
                    'allergen_detail' => $allergy->allergen_detail,
                    'start_date' => $allergy->start_date,
                    'reaction_description' => $allergy->reaction_description,
                    'severity_level' => $allergy->severity_level,
                    'resolved_status' => $allergy->resolved_status,
                    'resolution_date' => $allergy->resolution_date,
                    'treatment_given' => $allergy->treatment_given,
                ];
            });

        return [
            'consultations' => $consultations,
            'vaccinations' => $vaccinations,
            'allergies' => $allergies,
        ];
    }

    /**
     * Show the form for editing the specified pet
     */
    public function edit(string $uuid): Response|RedirectResponse
    {
        try {
            $pet = $this->petService->getByUuid($uuid);
            
            if (!$pet) {
                return redirect()->route('pets.index')
                    ->with('error', 'Pet not found.');
            }

            $pet->load(['client', 'breed.species']);

            // Format pet data for frontend
            $formattedPet = [
                'uuid' => $pet->uuid,
                'name' => $pet->name,
                'profile_img' => $pet->profile_img,
                'breed_id' => $pet->breed ? $pet->breed->uuid : null, // Use breed UUID for frontend
                'breed' => $pet->breed ? [
                    'uuid' => $pet->breed->uuid,
                    'name' => $pet->breed->breed_name ?? $pet->breed->name,
                    'species_id' => $pet->breed->species_id,
                    'species' => $pet->breed->species ? [
                        'uuid' => $pet->breed->species->uuid,
                        'name' => $pet->breed->species->name,
                    ] : null,
                ] : null,
                'sex' => $pet->sex,
                'neutered_status' => $pet->neutered_status,
                'dob' => $pet->dob,
                'microchip_ref' => $pet->microchip_ref,
                'weight_kg' => $pet->weight_kg,
                'bcs' => $pet->bcs,
                'color' => $pet->color,
                'notes' => $pet->notes,
                'deceased_at' => $pet->deceased_at,
            ];

            return Inertia::render('Pets/Edit', [
                'pet' => $formattedPet,
            ]);
        } catch (Exception $e) {
            return redirect()->route('pets.index')
                ->with('error', 'Error retrieving pet: ' . $e->getMessage());
        }
    }

    /**
     * Update the specified pet in storage
     */
    public function update(PetRequest $request, Pet $pet): RedirectResponse|JsonResponse
    {
        try {
            $validated = $request->validated();

            // Handle profile image upload
            if ($request->hasFile('profile_img')) {
                // Delete old image if exists
                if ($pet->profile_img) {
                    Storage::disk('public')->delete($pet->profile_img);
                }
                $image = $request->file('profile_img');
                $path = $image->store('pets', 'public');
                $validated['profile_img'] = $path;
            } else {
                // Preserve existing image if no new image is uploaded
                unset($validated['profile_img']);
            }

            // Remove species_id from validated data as it's not a direct column
            unset($validated['species_id']);

            $pet->update($validated);
            $pet->load(['client', 'breed']);

            if ($request->wantsJson() || $request->expectsJson()) {
                return response()->json([
                    'message' => 'Pet updated successfully.',
                    'pet' => [
                        'uuid' => $pet->uuid,
                        'name' => $pet->name,
                        'client_id' => $pet->client_id,
                        'breed_id' => $pet->breed_id,
                        'sex' => $pet->sex,
                        'neutered_status' => $pet->neutered_status,
                        'dob' => $pet->dob,
                        'microchip_ref' => $pet->microchip_ref,
                        'profile_img' => $pet->profile_img,
                        'weight_kg' => $pet->weight_kg,
                        'bcs' => $pet->bcs,
                        'color' => $pet->color,
                        'notes' => $pet->notes,
                        'deceased_at' => $pet->deceased_at,
                        'client' => $pet->client ? [
                            'uuid' => $pet->client->uuid,
                            'first_name' => $pet->client->first_name,
                            'last_name' => $pet->client->last_name,
                        ] : null,
                        'breed' => $pet->breed ? [
                            'uuid' => $pet->breed->uuid,
                            'name' => $pet->breed->breed_name,
                        ] : null,
                    ]
                ]);
            }
            
            return redirect()->route('pets.index')
                ->with('success', 'Pet updated successfully.');
        } catch (Exception $e) {
            Log::error('Error updating pet: ' . $e->getMessage(), [
                'pet_uuid' => $pet->uuid,
                'exception' => $e,
            ]);
            
            if ($request->wantsJson() || $request->expectsJson()) {
                return response()->json(['error' => 'Error updating pet: ' . $e->getMessage()], 422);
            }
            return back()->withInput()
                ->withErrors(['error' => 'Error updating pet: ' . $e->getMessage()]);
        }
    }

    /**
     * Get pets by client UUID
     */
    public function getByClient(string $clientUuid): JsonResponse
    {
        try {
            $pets = $this->petService->getByClientUuid($clientUuid);
            return response()->json($pets);
        } catch (Exception $e) {
            return response()->json(['error' => 'Error retrieving pets: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Get pet medical history (appointments, vaccinations, notes)
     * API endpoint for fetching medical history separately
     */
    public function getMedicalHistory(string $uuid): JsonResponse
    {
        try {
            $pet = Pet::where('uuid', $uuid)->firstOrFail();
            $medicalHistory = $this->getPetMedicalHistory($pet);

            // Also get notes and prescriptions for the API endpoint
            $user = Auth::user();
            $veterinarianId = null;
            if ($user && $user->veterinary) {
                $veterinarianId = $user->veterinary->id;
            }

            // Get notes
            $notesQuery = Note::where('pet_id', $pet->id)
                ->with(['veterinarian.user'])
                ->orderBy('date', 'desc');
            
            if ($veterinarianId) {
                $notesQuery->where('veterinarian_id', $veterinarianId);
            }
            
            $notes = $notesQuery->get()
                ->map(function ($note) {
                    return [
                        'uuid' => $note->uuid,
                        'date' => $note->date,
                        'veterinarian' => $note->veterinarian && $note->veterinarian->user ?
                            $note->veterinarian->user->firstname . ' ' . $note->veterinarian->user->lastname :
                            'Unknown',
                        'notes' => $note->notes,
                        'visit_type' => $note->visit_type,
                    ];
                });

            // Get prescriptions
            $prescriptionsQuery = Prescription::where('pet_id', $pet->id)
                ->with(['product', 'veterinarian.user'])
                ->orderBy('created_at', 'desc');
            
            if ($veterinarianId) {
                $prescriptionsQuery->where('veterinarian_id', $veterinarianId);
            }
            
            $prescriptions = $prescriptionsQuery->get()
                ->map(function ($prescription) {
                    return [
                        'uuid' => $prescription->uuid,
                        'medication' => $prescription->medication,
                        'product' => $prescription->product ? [
                            'uuid' => $prescription->product->uuid,
                            'name' => $prescription->product->name,
                        ] : null,
                        'dosage' => $prescription->dosage,
                        'frequency' => $prescription->frequency,
                        'duration' => $prescription->duration,
                        'instructions' => $prescription->instructions,
                        'prescribed_date' => $prescription->prescribed_date,
                    ];
                });

            return response()->json([
                'consultations' => $medicalHistory['consultations'],
                'vaccinations' => $medicalHistory['vaccinations'],
                'notes' => $notes,
                'allergies' => $medicalHistory['allergies'],
                'prescriptions' => $prescriptions,
            ]);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Failed to load medical history',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified pet from storage
     */
    public function destroy(Request $request, Pet $pet): RedirectResponse|JsonResponse
    {
        try {
            // Delete profile image if exists
            if ($pet->profile_img) {
                Storage::disk('public')->delete($pet->profile_img);
            }

            $this->petService->delete($pet->uuid);
            
            if ($request->wantsJson() || $request->expectsJson()) {
                return response()->json(['message' => 'Pet deleted successfully.']);
            }
            
            return redirect()->route('pets.index')
                ->with('success', 'Pet deleted successfully.');
        } catch (Exception $e) {
            if ($request->wantsJson() || $request->expectsJson()) {
                return response()->json(['error' => 'Error deleting pet: ' . $e->getMessage()], 500);
            }
            return redirect()->route('pets.index')
                ->with('error', 'Error deleting pet: ' . $e->getMessage());
        }
    }
}
