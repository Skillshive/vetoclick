<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CreateSpeciesRequest;
use App\Http\Requests\UpdateSpeciesRequest;
use App\services\SpeciesService;
use App\common\SpeciesDto;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
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
    public function index(Request $request): JsonResponse
    {
        try {
            $perPage = $request->get('per_page', 15);
            $search = $request->get('search');

            if ($search) {
                $species = $this->speciesService->searchByName($search, $perPage);
            } else {
                $species = $this->speciesService->getAll($perPage);
            }

            return response()->json([
                'success' => true,
                'data' => $species,
                'message' => 'Species retrieved successfully'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve species: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created species
     */
    public function store(CreateSpeciesRequest $request): JsonResponse
    {
        try {
            $dto = SpeciesDto::fromRequest($request);
            $species = $this->speciesService->create($dto);

            return response()->json([
                'success' => true,
                'data' => $species,
                'message' => 'Species created successfully'
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create species: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified species by ID
     */
    public function show(int $id): JsonResponse
    {
        try {
            $species = $this->speciesService->getById($id);

            if (!$species) {
                return response()->json([
                    'success' => false,
                    'message' => 'Species not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $species,
                'message' => 'Species retrieved successfully'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve species: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified species by UUID
     */
    public function showByUuid(string $uuid): JsonResponse
    {
        try {
            $species = $this->speciesService->getByUuid($uuid);

            if (!$species) {
                return response()->json([
                    'success' => false,
                    'message' => 'Species not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $species,
                'message' => 'Species retrieved successfully'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve species: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display species with breeds by ID
     */
    public function showWithBreeds(int $id): JsonResponse
    {
        try {
            $species = $this->speciesService->getWithBreeds($id);

            if (!$species) {
                return response()->json([
                    'success' => false,
                    'message' => 'Species not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $species,
                'message' => 'Species with breeds retrieved successfully'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve species: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified species by ID
     */
    public function update(UpdateSpeciesRequest $request, int $id): JsonResponse
    {
        try {
            $dto = SpeciesDto::fromRequest($request);
            $species = $this->speciesService->update($id, $dto);

            if (!$species) {
                return response()->json([
                    'success' => false,
                    'message' => 'Species not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $species,
                'message' => 'Species updated successfully'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update species: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified species by UUID
     */
    public function updateByUuid(UpdateSpeciesRequest $request, string $uuid): JsonResponse
    {
        try {
            $dto = SpeciesDto::fromRequest($request);
            $species = $this->speciesService->updateByUuid($uuid, $dto);

            if (!$species) {
                return response()->json([
                    'success' => false,
                    'message' => 'Species not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $species,
                'message' => 'Species updated successfully'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update species: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified species by ID
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $deleted = $this->speciesService->delete($id);

            if (!$deleted) {
                return response()->json([
                    'success' => false,
                    'message' => 'Species not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Species deleted successfully'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete species: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified species by UUID
     */
    public function destroyByUuid(string $uuid): JsonResponse
    {
        try {
            $deleted = $this->speciesService->deleteByUuid($uuid);

            if (!$deleted) {
                return response()->json([
                    'success' => false,
                    'message' => 'Species not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Species deleted successfully'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete species: ' . $e->getMessage()
            ], 500);
        }
    }
}
