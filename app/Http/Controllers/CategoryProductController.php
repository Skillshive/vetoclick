<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateCategoryProductRequest;
use App\Http\Requests\UpdateCategoryProductRequest;
use App\Http\Resources\CategoryProductResource;
use App\Services\CategoryProductService;
use App\common\CategoryProductDto;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Exception;

class CategoryProductController extends Controller
{
    protected CategoryProductService $categoryProductService;

    public function __construct(CategoryProductService $categoryProductService)
    {
        $this->categoryProductService = $categoryProductService;
    }

    /**
     * Display a listing of category products
     */
    public function index(Request $request): Response
    {
        $perPage = $request->get('per_page', 15);
        $search = $request->get('search');
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');

        try {
            if ($search) {
                $categoryProducts = $this->categoryProductService->searchByName($search, $perPage);
            } else {
                $categoryProducts = $this->categoryProductService->getAll($perPage);
            }

            return Inertia::render('Category_products/Index', [
                'categoryProducts' => [
                    'data' => $categoryProducts->items(),
                    'meta' => [
                        'current_page' => $categoryProducts->currentPage(),
                        'from' => $categoryProducts->firstItem(),
                        'last_page' => $categoryProducts->lastPage(),
                        'per_page' => $categoryProducts->perPage(),
                        'to' => $categoryProducts->lastItem(),
                        'total' => $categoryProducts->total(),
                    ],
                    'links' => [
                        'first' => $categoryProducts->url(1),
                        'last' => $categoryProducts->url($categoryProducts->lastPage()),
                        'prev' => $categoryProducts->previousPageUrl(),
                        'next' => $categoryProducts->nextPageUrl(),
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
            return Inertia::render('Category_products/Index', [
                'categoryProducts' => ['data' => [], 'meta' => null, 'links' => null],
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
     * Store a newly created category product
     */
    public function store(CreateCategoryProductRequest $request): RedirectResponse
    {
        try {
            $dto = CategoryProductDto::fromRequest($request);
            $this->categoryProductService->create($dto);

            return redirect()->route('category-products.index')
                ->with('success', __('common.category_product_created'));
        } catch (Exception $e) {
            return redirect()->back()
                ->withInput()
                ->withErrors(['error' => __('common.error') . ': ' . $e->getMessage()]);
        }
    }
    
    /**
     * Update the specified category product by UUID
     */
    public function update(UpdateCategoryProductRequest $request, string $uuid): RedirectResponse
    {
        try {
            $dto = CategoryProductDto::fromRequest($request);
            $categoryProduct = $this->categoryProductService->update($uuid, $dto);

            if (!$categoryProduct) {
                return redirect()->back()
                    ->withErrors(['error' => __('common.category_product_not_found')]);
            }

            return redirect()->route('category-products.index')
                ->with('success', __('common.category_product_updated'));
        } catch (Exception $e) {
            return redirect()->back()
                ->withInput()
                ->withErrors(['error' => __('common.error') . ': ' . $e->getMessage()]);
        }
    }

    /**
     * Remove the specified category product by UUID
     */
    public function destroy(string $uuid): RedirectResponse
    {
        try {
            $deleted = $this->categoryProductService->delete($uuid);

            if (!$deleted) {
                return redirect()->back()
                    ->withErrors(['error' => __('common.category_product_not_found')]);
            }

            return redirect()->route('category-products.index')
                ->with('success', __('common.category_product_deleted'));
        } catch (Exception $e) {
            return redirect()->back()
                ->withErrors(['error' => __('common.error') . ': ' . $e->getMessage()]);
        }
    }
}
