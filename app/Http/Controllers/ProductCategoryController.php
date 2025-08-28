<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateProductCategoryRequest;
use App\Http\Requests\UpdateProductCategoryRequest;
use App\Services\ProductCategoryService;
use App\common\ProductCategoryDto;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Exception;

class ProductCategoryController extends Controller
{
    protected ProductCategoryService $productCategoryService;

    public function __construct(ProductCategoryService $productCategoryService)
    {
        $this->productCategoryService = $productCategoryService;
    }

    public function index(Request $request): Response
    {
        $perPage = $request->get('per_page', 15);
        try {
            $categories = $this->productCategoryService->getAll($perPage);

            return Inertia::render('ProductCategories/Index', [
                'categories' => [
                    'data' => $categories->items(),
                    'meta' => [
                        'current_page' => $categories->currentPage(),
                        'from' => $categories->firstItem(),
                        'last_page' => $categories->lastPage(),
                        'per_page' => $categories->perPage(),
                        'to' => $categories->lastItem(),
                        'total' => $categories->total(),
                    ],
                    'links' => [
                        'first' => $categories->url(1),
                        'last' => $categories->url($categories->lastPage()),
                        'prev' => $categories->previousPageUrl(),
                        'next' => $categories->nextPageUrl(),
                    ]
                ],
                'filters' => [
                    'per_page' => $perPage,
                ]
            ]);
        } catch (Exception $e) {
            return Inertia::render('ProductCategories/Index', [
                'categories' => ['data' => [], 'meta' => null, 'links' => null],
                'filters' => [
                    'per_page' => $perPage,
                ],
                'error' => 'Failed to retrieve categories: ' . $e->getMessage()
            ]);
        }
    }
    
    public function store(CreateProductCategoryRequest $request): RedirectResponse
    {
        try {
            $dto = ProductCategoryDto::fromRequest($request);
            $this->productCategoryService->create($dto);

            return redirect()->route('product_categories.index')
                ->with('success', 'Category created successfully');
        } catch (Exception $e) {
            return redirect()->back()
                ->withInput()
                ->withErrors(['error' => 'Failed to create category: ' . $e->getMessage()]);
        }
    }
    
    public function update(UpdateProductCategoryRequest $request, int $id): RedirectResponse
    {
        try {
            $dto = ProductCategoryDto::fromRequest($request);
            $category = $this->productCategoryService->update($id, $dto);

            if (!$category) {
                return redirect()->back()
                    ->withErrors(['error' => 'Category not found']);
            }

            return redirect()->route('product_categories.index')
                ->with('success', 'Category updated successfully');
        } catch (Exception $e) {
            return redirect()->back()
                ->withInput()
                ->withErrors(['error' => 'Failed to update category: ' . $e->getMessage()]);
        }
    }

    public function destroy(int $id): RedirectResponse
    {
        try {
            $deleted = $this->productCategoryService->delete($id);

            if (!$deleted) {
                return redirect()->back()
                    ->withErrors(['error' => 'Category not found']);
            }

            return redirect()->route('product_categories.index')
                ->with('success', 'Category deleted successfully');
        } catch (Exception $e) {
            return redirect()->back()
                ->withErrors(['error' => 'Failed to delete category: ' . $e->getMessage()]);
        }
    }
}
