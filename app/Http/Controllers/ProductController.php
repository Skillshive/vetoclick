<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Services\ProductService;
use App\common\ProductDto;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Exception;

class ProductController extends Controller
{
    protected ProductService $productService;

    public function __construct(ProductService $productService)
    {
        $this->productService = $productService;
    }

    public function index(Request $request): Response
    {
        $perPage = $request->get('per_page', 15);
        $search = $request->get('search');

        try {
            if ($search) {
                $products = $this->productService->search($search, $perPage);
            } else {
                $products = $this->productService->getAll($perPage);
            }

            return Inertia::render('Products/Index', [
                'products' => [
                    'data' => $products->items(),
                    'meta' => [
                        'current_page' => $products->currentPage(),
                        'from' => $products->firstItem(),
                        'last_page' => $products->lastPage(),
                        'per_page' => $products->perPage(),
                        'to' => $products->lastItem(),
                        'total' => $products->total(),
                    ],
                    'links' => [
                        'first' => $products->url(1),
                        'last' => $products->url($products->lastPage()),
                        'prev' => $products->previousPageUrl(),
                        'next' => $products->nextPageUrl(),
                    ]
                ],
                'filters' => [
                    'search' => $search,
                    'per_page' => $perPage,
                ]
            ]);
        } catch (Exception $e) {
            return Inertia::render('Products/Index', [
                'products' => ['data' => [], 'meta' => null, 'links' => null],
                'filters' => [
                    'search' => $search,
                    'per_page' => $perPage,
                ],
                'error' => 'Failed to retrieve products: ' . $e->getMessage()
            ]);
        }
    }
    
    public function store(CreateProductRequest $request): RedirectResponse
    {
        try {
            $dto = ProductDto::fromRequest($request);
            $this->productService->create($dto);

            return redirect()->route('products.index')
                ->with('success', 'Product created successfully');
        } catch (Exception $e) {
            return redirect()->back()
                ->withInput()
                ->withErrors(['error' => 'Failed to create product: ' . $e->getMessage()]);
        }
    }
    
    public function update(UpdateProductRequest $request, int $id): RedirectResponse
    {
        try {
            $dto = ProductDto::fromRequest($request);
            $product = $this->productService->update($id, $dto);

            if (!$product) {
                return redirect()->back()
                    ->withErrors(['error' => 'Product not found']);
            }

            return redirect()->route('products.index')
                ->with('success', 'Product updated successfully');
        } catch (Exception $e) {
            return redirect()->back()
                ->withInput()
                ->withErrors(['error' => 'Failed to update product: ' . $e->getMessage()]);
        }
    }

    public function destroy(int $id): RedirectResponse
    {
        try {
            $deleted = $this->productService->delete($id);

            if (!$deleted) {
                return redirect()->back()
                    ->withErrors(['error' => 'Product not found']);
            }

            return redirect()->route('products.index')
                ->with('success', 'Product deleted successfully');
        } catch (Exception $e) {
            return redirect()->back()
                ->withErrors(['error' => 'Failed to delete product: ' . $e->getMessage()]);
        }
    }
}
