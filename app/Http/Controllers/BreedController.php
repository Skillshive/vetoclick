<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateBreedRequest;
use App\Http\Requests\UpdateBreedRequest;
use App\Services\BreedService;
use App\common\BreedDTO;
use Illuminate\Http\RedirectResponse;
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
    public function store(CreateBreedRequest $request): RedirectResponse
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
    public function update(UpdateBreedRequest $request, string $uuid): RedirectResponse
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
}
