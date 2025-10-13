<?php

namespace App\Http\Controllers;

use App\DTOs\ProductDto;
use App\Http\Requests\Product\CreateProductRequest;
use App\Http\Requests\Product\UpdateProductRequest;
use App\Services\ProductService;
use App\Http\Resources\Product\ProductResource;
use App\Services\CsvService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;
use Exception;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Illuminate\Validation\Factory;

class ProductController extends Controller
{
    protected ProductService $productService;

    public function __construct(ProductService $productService)
    {
        $this->productService = $productService;
    }

    /**
     * Display a listing of products
     */
    public function index(Request $request): Response
    {
        $perPage = $request->get('per_page', 10);
        $search = $request->get('search');
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $categoryIds = $request->get('category'); // Can be string or array
        $typeIds = $request->get('type'); // Can be string or array
        $statusIds = $request->get('status'); // Can be string or array
        $page = $request->get('page', 1);

        // Convert to array if it's a string
        if (is_string($categoryIds)) {
            $categoryIds = $categoryIds ? explode(',', $categoryIds) : [];
        } elseif (!is_array($categoryIds)) {
            $categoryIds = [];
        }

        if (is_string($typeIds)) {
            $typeIds = $typeIds ? explode(',', $typeIds) : [];
        } elseif (!is_array($typeIds)) {
            $typeIds = [];
        }

        if (is_string($statusIds)) {
            $statusIds = $statusIds ? explode(',', $statusIds) : [];
        } elseif (!is_array($statusIds)) {
            $statusIds = [];
        }

        try {
            $query = $this->productService->query();

            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('sku', 'like', "%{$search}%")
                      ->orWhere('barcode', 'like', "%{$search}%");
                });
            }

            if (!empty($categoryIds)) {
                $query->whereIn('category_product_id', $categoryIds);
            }

            if (!empty($typeIds)) {
                $query->whereIn('type', $typeIds);
            }

            if (!empty($statusIds)) {
                $query->whereIn('availability_status', $statusIds);
            }

            $products = $query->paginate($perPage, ['*'], 'page', $page);

            // Get all categories for filter selection
            $categories = \App\Models\CategoryProduct::all();

            return Inertia::render('Products/Index', [
                'products' => [
                    'data' => ProductResource::collection($products->items())->toArray(request()),
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
                'categories' => $categories,
                'filters' => [
                    'search' => $search,
                    'per_page' => $perPage,
                    'sort_by' => $sortBy,
                    'sort_direction' => $sortDirection,
                ],
                'old' => $request->old(),
                'errors' => $request->session()->get('errors')
            ])->with([
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error')
            ]);
        } catch (Exception $e) {
            // Get categories even in error case
            $categories = \App\Models\CategoryProduct::all();

            return Inertia::render('Products/Index', [
                'products' => [
                    'data' => [],
                    'meta' => null,
                    'links' => null
                ],
                'categories' => $categories,
                'filters' => [
                    'search' => $search,
                    'per_page' => $perPage,
                    'sort_by' => $sortBy,
                    'sort_direction' => $sortDirection,
                ],
                'error' => __('common.error')
            ]);
        }
    }

    /**
     * Show the form for creating a new product
     */
    public function create(): Response
    {
        try {
            // Get all categories for the form
            $categories = \App\Models\CategoryProduct::all();

            return Inertia::render('Products/ProductForm', [
                'categories' => $categories,
            ]);
        } catch (Exception $e) {
            return Inertia::render('Products/ProductForm', [
                'categories' => [],
                'error' => __('common.error')
            ]);
        }
    }
    
    /**
     * Store a newly created product
     */
    public function store(CreateProductRequest $request): RedirectResponse
    {
        try {
            $dto = ProductDto::fromRequest($request);
            
            // Handle image upload
            if ($request->hasFile('image')) {
                $image = $request->file('image');
                $imageName = time() . '_' . $image->getClientOriginalName();
                $imagePath = $image->storeAs('images/products', $imageName, 'public');
                
                // Create image record
                $imageModel = \App\Models\Image::create([
                    'name' => $imageName,
                    'path' => $imagePath
                ]);
                
                $dto->image_id = $imageModel->id;
            }
            
            $this->productService->create($dto);

            return redirect()->route('products.index')
                ->with('success', __('common.product_created'));
        } catch (Exception $e) {
            return redirect()->back()
                ->withInput()
                ->withErrors(['error' => __('common.error') . ': ' . $e->getMessage()]);
        }
    }

    /**
     * Show the form for editing the specified product
     */
    public function edit(string $uuid): Response
    {
        try {
            $product = $this->productService->getByUuid($uuid);
            
            if (!$product) {
                return redirect()->route('products.index')
                    ->withErrors(['error' => __('common.product_not_found')]);
            }

            // Load the category and image relationships
            $product->load(['category', 'image']);

            // Get all categories for the form
            $categories = \App\Models\CategoryProduct::all();

            return Inertia::render('Products/ProductForm', [
                'product' => new ProductResource($product),
                'categories' => $categories,
            ]);
        } catch (Exception $e) {
            return redirect()->route('products.index')
                ->withErrors(['error' => __('common.error') . ': ' . $e->getMessage()]);
        }
    }

    /**
     * Update the specified product by UUID
     */
    public function update(UpdateProductRequest $request, string $uuid): mixed
    {
        try {
            $dto = ProductDto::fromRequest($request);
            
            if ($request->hasFile('image')) {
                $image = $request->file('image');
                $imageName = time() . '_' . $image->getClientOriginalName();
                $imagePath = $image->storeAs('images/products', $imageName, 'public');
                
                $imageModel = \App\Models\Image::create([
                    'name' => $imageName,
                    'path' => $imagePath
                ]);
                
                $dto->image_id = $imageModel->id;
            }
            
            $product = $this->productService->update($uuid, $dto);

            if (!$product) {
                return redirect()->back()
                    ->withErrors(['error' => __('common.product_not_found')]);
            }

            return redirect()->route('products.index')
                ->with('success', __('common.product_updated'));
        } catch (Exception $e) {
            return redirect()->back()
                ->withInput()
                ->withErrors(['error' => __('common.error') . ': ' . $e->getMessage()]);
        }
    }

    /**
     * Remove the specified product by UUID
     */
    public function destroy(string $uuid): RedirectResponse
    {
        try {
            $deleted = $this->productService->delete($uuid);

            if (!$deleted) {
                return redirect()->back()
                    ->withErrors(['error' => __('common.product_not_found')]);
            }

            return redirect()->route('products.index')
                ->with('success', __('common.product_deleted'));
        } catch (Exception $e) {
            return redirect()->back()
                ->withErrors(['error' => __('common.error') . ': ' . $e->getMessage()]);
        }
    }

    // API Methods for AJAX requests
    /**
     * Get all products (JSON response for AJAX)
     */
    public function apiIndex(Request $request): JsonResponse
    {
        try {
            $perPage = $request->input('per_page', 15);
            $products = $this->productService->getAll($perPage);

            return response()->json([
                'success' => true,
                'data' => ProductResource::collection($products->items()),
                'pagination' => [
                    'current_page' => $products->currentPage(),
                    'last_page' => $products->lastPage(),
                    'per_page' => $products->perPage(),
                    'total' => $products->total()
                ]
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve products',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get product by UUID (JSON response for AJAX)
     */
    public function apiShow(string $uuid): JsonResponse
    {
        try {
            $product = $this->productService->getByUuid($uuid);

            if (!$product) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => new ProductResource($product)
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve product',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Search products by name
     */
    public function search(Request $request): JsonResponse
    {
        try {
            $searchTerm = $request->input('search');
            if (!$searchTerm) {
                return response()->json([
                    'success' => false,
                    'message' => 'Search term is required'
                ], 422);
            }

            $products = $this->productService->searchByName($searchTerm);

            return response()->json([
                'success' => true,
                'data' => ProductResource::collection($products)
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to search products',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all products as collection (for dropdowns, etc.)
     */
    public function getAllAsCollection(): JsonResponse
    {
        try {
            $products = $this->productService->getAllAsCollection();

            return response()->json([
                'success' => true,
                'data' => ProductResource::collection($products)
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve products',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export products to CSV
     */
    public function export(): StreamedResponse|RedirectResponse
    {
        try {
            $products = $this->productService->getAllForExport();
            
            $records = $products->map(function ($product) {
                return [
                    'Name' => $product->name,
                    'SKU' => $product->sku,
                    'Brand' => $product->brand ?? '',
                    'Description' => $product->description ?? '',
                    'Barcode' => $product->barcode ?? '',
                    'Category' => $product->category?->name ?? '',
                    'Type' => $product->type ?? '',
                    'Dosage Form' => $product->dosage_form ?? '',
                    'Prescription Required' => $product->prescription_required ? 'Yes' : 'No',
                    'Minimum Stock Level' => $product->minimum_stock_level ?? '',
                    'Maximum Stock Level' => $product->maximum_stock_level ?? '',
                    'Is Active' => $product->is_active ? 'Yes' : 'No',
                    'Availability Status' => $product->availability_status ?? '',
                    'Notes' => $product->notes ?? '',
                ];
            })->toArray();

            $csvService = new CsvService();
            return $csvService->export(
                ['Name', 'SKU', 'Brand', 'Description', 'Barcode', 'Category', 'Type', 'Dosage Form', 'Prescription Required', 'Minimum Stock Level', 'Maximum Stock Level', 'Is Active', 'Availability Status', 'Notes'],
                array_values($records), 
                'products.csv'
            );
        } catch (Exception $e) {
            return redirect()->back()
                ->withErrors(['error' => __('common.export_error')]);
        }
    }
}
