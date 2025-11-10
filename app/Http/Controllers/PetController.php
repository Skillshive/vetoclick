<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreatePetRequest;
use App\Http\Requests\UpdatePetRequest;
use App\Services\PetService;
use App\common\PetDTO;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Exception;
use Illuminate\Http\JsonResponse;

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
    public function index(Request $request): Response
    {
        $perPage = $request->get('per_page', 15);
        $filters = $request->only(['search', 'client_id', 'species_id']);

        try {
            $pets = $this->petService->getAll($filters, $perPage);

            return Inertia::render('Pets/Index', [
                'pets' => [
                    'data' => $pets['data'],
                    'meta' => $pets['meta']
                ],
                'filters' => $filters
            ]);
        } catch (Exception $e) {
            return redirect()->back()->with('error', 'Error retrieving pets: ' . $e->getMessage());
        }
    }

    /**
     * Show the form for creating a new pet
     */
    public function create(): Response
    {
        return Inertia::render('Pets/Create');
    }

    /**
     * Store a newly created pet in storage
     */
    public function store(CreatePetRequest $request): RedirectResponse
    {
        try {
            $dto = new PetDTO(...$request->validated());
            $this->petService->create($dto);
            
            return redirect()->route('pets.index')
                ->with('success', 'Pet created successfully.');
        } catch (Exception $e) {
            return back()->withInput()
                ->withErrors(['error' => 'Error creating pet: ' . $e->getMessage()]);
        }
    }

    /**
     * Display the specified pet
     */
    public function show(string $uuid): Response|RedirectResponse
    {
        try {
            $pet = $this->petService->getByUuid($uuid);
            
            if (!$pet) {
                return redirect()->route('pets.index')
                    ->with('error', 'Pet not found.');
            }

            return Inertia::render('Pets/Show', [
                'pet' => $pet->load(['client', 'species', 'breed'])
            ]);
        } catch (Exception $e) {
            return redirect()->route('pets.index')
                ->with('error', 'Error retrieving pet: ' . $e->getMessage());
        }
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

            return Inertia::render('Pets/Edit', [
                'pet' => $pet->load(['client', 'species', 'breed'])
            ]);
        } catch (Exception $e) {
            return redirect()->route('pets.index')
                ->with('error', 'Error retrieving pet: ' . $e->getMessage());
        }
    }

    /**
     * Update the specified pet in storage
     */
    public function update(UpdatePetRequest $request, string $uuid): RedirectResponse
    {
        try {
            $pet = $this->petService->getByUuid($uuid);
            
            if (!$pet) {
                return redirect()->route('pets.index')
                    ->with('error', 'Pet not found.');
            }

            $dto = new PetDTO(...$request->validated());
            $this->petService->update($pet, $dto);
            
            return redirect()->route('pets.show', $uuid)
                ->with('success', 'Pet updated successfully.');
        } catch (Exception $e) {
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
     * Remove the specified pet from storage
     */
    public function destroy(string $uuid): RedirectResponse
    {
        try {
            $pet = $this->petService->getByUuid($uuid);
            
            if (!$pet) {
                return redirect()->route('pets.index')
                    ->with('error', 'Pet not found.');
            }

            $this->petService->delete($pet);
            
            return redirect()->route('pets.index')
                ->with('success', 'Pet deleted successfully.');
        } catch (Exception $e) {
            return redirect()->route('pets.index')
                ->with('error', 'Error deleting pet: ' . $e->getMessage());
        }
    }
}
