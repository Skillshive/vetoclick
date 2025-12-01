<?php

namespace App\Http\Controllers;

use App\DTOs\BreedDTO;
use App\Services\BreedService;
use App\Http\Requests\BreedRequest;
use App\Http\Resources\BreedResource;
use App\Models\Species;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;
use Exception;

class BreedController extends Controller
{
    protected BreedService $breedService;

    public function __construct(BreedService $breedService)
    {
        $this->breedService = $breedService;
    }

    /**
     * Store a newly created breed
     */
    public function store(BreedRequest $request): RedirectResponse
    {
        try {
            $dto = BreedDTO::fromRequest($request);

            $this->breedService->create($dto);

            return redirect()->back()
                ->with('success', __('common.breed_created'));
        } catch (Exception $e) {
            return redirect()->back()
                ->withInput()
                ->withErrors(['error' => __('common.error')]);
        }
    }

    /**
     * Update the specified breed by UUID
     */
    public function update(BreedRequest $request, string $uuid): RedirectResponse
    {
        try {
            $dto = BreedDTO::fromRequest($request);
            $breed = $this->breedService->update($uuid, $dto);

            if (!$breed) {
                return redirect()->back()
                    ->withErrors(['error' => __('common.breed_not_found')]);
            }

            return redirect()->back()
                ->with('success', __('common.breed_updated'));
        } catch (Exception $e) {
            return redirect()->back()
                ->withInput()
                ->withErrors(['error' => __('common.error')]);
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
                ->withErrors(['error' => __('common.error')]);
        }
    }

    /**
     * Get breeds by species UUID
     */
    public function getBySpecies(string $speciesUuid): JsonResponse
    {
        try {
            $species = Species::where('uuid', $speciesUuid)->first();
            
            if (!$species) {
                return response()->json([
                    'data' => [],
                    'message' => 'Species not found'
                ], 404);
            }

            $breeds = $this->breedService->getBySpeciesId($species->id, 0);
            
            return response()->json([
                'data' => BreedResource::collection($breeds->items())
            ]);
        } catch (Exception $e) {
            return response()->json([
                'data' => [],
                'message' => 'Error fetching breeds'
            ], 500);
        }
    }
}
