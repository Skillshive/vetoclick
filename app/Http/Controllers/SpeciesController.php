<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateSpeciesRequest;
use App\Http\Requests\UpdateSpeciesRequest;
use App\Http\Resources\SpeciesResource;
use App\Services\SpeciesService;
use App\common\SpeciesDto;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Exception;

class SpeciesController extends Controller
{
    protected SpeciesService $speciesService;

    public function __construct(SpeciesService $speciesService)
    {
        $this->speciesService = $speciesService;
    }

    /**
     * Display a listing of species
     */
    public function index(Request $request): Response
    {
        $perPage = $request->get('per_page', 15);
        $search = $request->get('search');
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');

        try {
            if ($search) {
                $species = $this->speciesService->searchByName($search, $perPage);
            } else {
                $species = $this->speciesService->getAll($perPage);
            }

            return Inertia::render('Species/Index', [
                'species' => [
                    'data' => $species->items(),
                    'meta' => [
                        'current_page' => $species->currentPage(),
                        'from' => $species->firstItem(),
                        'last_page' => $species->lastPage(),
                        'per_page' => $species->perPage(),
                        'to' => $species->lastItem(),
                        'total' => $species->total(),
                    ],
                    'links' => [
                        'first' => $species->url(1),
                        'last' => $species->url($species->lastPage()),
                        'prev' => $species->previousPageUrl(),
                        'next' => $species->nextPageUrl(),
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
            return Inertia::render('Species/Index', [
                'species' => ['data' => [], 'meta' => null, 'links' => null],
                'filters' => [
                    'search' => $search,
                    'per_page' => $perPage,
                    'sort_by' => $sortBy,
                    'sort_direction' => $sortDirection,
                ],
                'error' => __('common.error') . ': ' . $e->getMessage()
            ]);
        }
    }
    
    /**
     * Store a newly created species
     */
    public function store(CreateSpeciesRequest $request): RedirectResponse
    {
        try {
            $dto = SpeciesDto::fromRequest($request);
            $this->speciesService->create($dto);

            return redirect()->route('species.index')
                ->with('success', __('common.species_created'));
        } catch (Exception $e) {
            return redirect()->back()
                ->withInput()
                ->withErrors(['error' => __('common.error') . ': ' . $e->getMessage()]);
        }
    }
    
    /**
     * Update the specified species by UUID
     */
    public function update(UpdateSpeciesRequest $request, string $uuid): RedirectResponse
    {
        try {
            $dto = SpeciesDto::fromRequest($request);
            $species = $this->speciesService->update($uuid, $dto);

            if (!$species) {
                return redirect()->back()
                    ->withErrors(['error' => __('common.species_not_found')]);
            }

            return redirect()->route('species.index')
                ->with('success', __('common.species_updated'));
        } catch (Exception $e) {
            return redirect()->back()
                ->withInput()
                ->withErrors(['error' => __('common.error') . ': ' . $e->getMessage()]);
        }
    }

    /**
     * Remove the specified species by UUID
     */
    public function destroy(string $uuid): RedirectResponse
    {
        try {
            $deleted = $this->speciesService->delete($uuid);

            if (!$deleted) {
                return redirect()->back()
                    ->withErrors(['error' => __('common.species_not_found')]);
            }

            return redirect()->route('species.index')
                ->with('success', __('common.species_deleted'));
        } catch (Exception $e) {
            return redirect()->back()
                ->withErrors(['error' => __('common.error') . ': ' . $e->getMessage()]);
        }
    }
}