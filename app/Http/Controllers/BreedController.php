<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateBreedRequest;
use App\Http\Requests\UpdateBreedRequest;
use App\Http\Resources\BreedResource;
use App\Services\BreedService;
use App\common\BreedDTO;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Exception;

class BreedController extends Controller
{
    protected BreedService $breedService;

    public function __construct(BreedService $breedService)
    {
        $this->breedService = $breedService;
    }

    /**
     * Display a listing of breeds
     */
    public function index(Request $request): Response
    {
        $perPage = $request->get('per_page', 15);
        $search = $request->get('search');
        $speciesId = $request->get('species_id');

        try {
            if ($speciesId) {
                $breeds = $this->breedService->getBySpeciesId($speciesId, $perPage);
            } elseif ($search) {
                $breeds = $this->breedService->searchByName($search, $perPage);
            } else {
                $breeds = $this->breedService->getAll($perPage);
            }

            return Inertia::render('Breeds/Index', [
                'breeds' => [
                    'data' => BreedResource::collection($breeds->items()),
                    'meta' => [
                        'current_page' => $breeds->currentPage(),
                        'from' => $breeds->firstItem(),
                        'last_page' => $breeds->lastPage(),
                        'per_page' => $breeds->perPage(),
                        'to' => $breeds->lastItem(),
                        'total' => $breeds->total(),
                    ],
                    'links' => [
                        'first' => $breeds->url(1),
                        'last' => $breeds->url($breeds->lastPage()),
                        'prev' => $breeds->previousPageUrl(),
                        'next' => $breeds->nextPageUrl(),
                    ]
                ],
                'filters' => [
                    'search' => $search,
                    'per_page' => $perPage,
                    'species_id' => $speciesId,
                ]
            ]);
        } catch (Exception $e) {
            return Inertia::render('Breeds/Index', [
                'breeds' => ['data' => [], 'meta' => null, 'links' => null],
                'filters' => [
                    'search' => $search,
                    'per_page' => $perPage,
                    'species_id' => $speciesId,
                ],
                'error' => __('common.error') . ': ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Get breeds for a specific species (API endpoint for frontend)
     */
    public function getBySpecies(string $speciesUuid, Request $request): Response
    {
        $perPage = $request->get('per_page', 8); 

        try {
            // Get species by UUID first
            $speciesService = app(\App\Services\SpeciesService::class);
            $species = $speciesService->getByUuid($speciesUuid);

            if (!$species) {
                return Inertia::render('Error', [
                    'message' => __('common.species_not_found'),
                    'status' => 404
                ]);
            }

            $breeds = $this->breedService->getBySpeciesId($species->id, $perPage);

            return Inertia::render('Breeds/Index', [
                'breeds' => [
                    'data' => BreedResource::collection($breeds->items()),
                    'meta' => [
                        'current_page' => $breeds->currentPage(),
                        'from' => $breeds->firstItem(),
                        'last_page' => $breeds->lastPage(),
                        'per_page' => $breeds->perPage(),
                        'to' => $breeds->lastItem(),
                        'total' => $breeds->total(),
                    ],
                    'links' => [
                        'first' => $breeds->url(1),
                        'last' => $breeds->url($breeds->lastPage()),
                        'prev' => $breeds->previousPageUrl(),
                        'next' => $breeds->nextPageUrl(),
                    ]
                ],
                'species' => $species,
                'filters' => [
                    'per_page' => $perPage,
                    'species_uuid' => $speciesUuid,
                ]
            ]);
        } catch (Exception $e) {
            return Inertia::render('Error', [
                'message' => __('common.error') . ': ' . $e->getMessage(),
                'status' => 500
            ]);
        }
    }

    /**
     * Store a newly created breed
     */
    public function store(CreateBreedRequest $request): RedirectResponse
    {
        try {
            $dto = BreedDTO::fromRequest($request);

            // Handle image upload
            $imageFile = $request->hasFile('image') ? $request->file('image') : null;

            $this->breedService->create($dto, $imageFile);

            return redirect()->back()
                ->with('success', __('common.breed_created'));
        } catch (Exception $e) {
            return redirect()->back()
                ->withInput()
                ->withErrors(['error' => __('common.error') . ': ' . $e->getMessage()]);
        }
    }

    /**
     * Show the form for editing the specified breed
     */
    public function edit(string $uuid): Response
    {
        try {
            $breed = $this->breedService->getByUuid($uuid);

            if (!$breed) {
                return Inertia::render('Error', [
                    'message' => __('common.breed_not_found'),
                    'status' => 404
                ]);
            }

            return Inertia::render('Breeds/Edit', [
                'breed' => new BreedResource($breed),
            ]);
        } catch (Exception $e) {
            return Inertia::render('Error', [
                'message' => __('common.error') . ': ' . $e->getMessage(),
                'status' => 500
            ]);
        }
    }

    /**
     * Update the specified breed by UUID
     */
    public function update(UpdateBreedRequest $request, string $uuid): RedirectResponse
    {
        try {
            // Debug logging
            Log::info('Breed update request data', [
                'all' => $request->all(),
                'input' => $request->input(),
                'has_file' => $request->hasFile('image'),
                'files' => $request->allFiles()
            ]);

            $dto = BreedDTO::fromRequest($request);

            // Handle image upload
            $imageFile = $request->hasFile('image') ? $request->file('image') : null;
            $breed = $this->breedService->update($uuid, $dto, $imageFile);

            if (!$breed) {
                return redirect()->back()
                    ->withErrors(['error' => __('common.breed_not_found')]);
            }

            return redirect()->back()
                ->with('success', __('common.breed_updated'));
        } catch (Exception $e) {
            return redirect()->back()
                ->withInput()
                ->withErrors(['error' => __('common.error') . ': ' . $e->getMessage()]);
        }
    }

    /**
     * Remove the specified breed by UUID
     */
    public function destroy(string $uuid): RedirectResponse
    {
        try {
            $deleted = $this->breedService->delete($uuid);

            if (!$deleted) {
                return redirect()->back()
                    ->withErrors(['error' => __('common.breed_not_found')]);
            }

            return redirect()->back()
                ->with('success', __('common.breed_deleted'));
        } catch (Exception $e) {
            return redirect()->back()
                ->withErrors(['error' => __('common.error') . ': ' . $e->getMessage()]);
        }
    }
}
