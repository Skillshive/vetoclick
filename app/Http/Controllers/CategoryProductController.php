<?php

namespace App\Http\Controllers;

use App\DTOs\Stock\CategoryProductDto;
use App\Services\CategoryProductService;
use App\Http\Requests\Stock\CategoryProductRequest;
use App\Http\Requests\Stock\ImportCategoryProductRequest;
use App\Http\Resources\Stock\CategoryProductResource;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Exception;
use App\Services\CsvService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\Factory;
use Symfony\Component\HttpFoundation\StreamedResponse;

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
        $parentCategoryId = $request->get('parent_category');

        try {
            $query = $this->categoryProductService->query();
            
            if ($search) {
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            }
            
            if ($parentCategoryId) {
                $query->where('category_product_id', $parentCategoryId);
            }
            
            $categoryProducts = $query->paginate($perPage);

            // Get all categories for parent selection
            $parentCategories = $this->categoryProductService->getAllWithoutPagination();

            return Inertia::render('Category_products/Index', [
                'categoryProducts' => [
                    'data' => CategoryProductResource::collection($categoryProducts->items()),
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
                'parentCategories' => CategoryProductResource::collection($parentCategories),
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
                'error' => __('common.error') 
            ]);
        }
    }
    
    /**
     * Store a newly created category product
     */
    public function store(CategoryProductRequest $request): RedirectResponse
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
    public function update(CategoryProductRequest $request, string $uuid): RedirectResponse
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
                ->withErrors(['error' => __('common.error') ]);
        }
    }

    /**
     * Export category products to CSV
     */
    public function export(): StreamedResponse|RedirectResponse
    {
        try {
            $categories = $this->categoryProductService->getAllWithoutPagination();
            
            $records = $categories->map(function ($category) {
                return [
                    'Name' => $category->name,
                    'Description' => $category->description,
                    'Parent Category' => $category->parent_category?->name ?? '',
                ];
            })->toArray();

            $csvService = new CsvService();
            return $csvService->export(
                ['Name', 'Description', 'Parent Category'],
                array_values($records), 
                'category-products.csv'
            );
        } catch (Exception $e) {
            return redirect()->back()
                ->withErrors(['error' => __('common.export_error')]);
        }
    }

    /**
     * Import category products from CSV
     */
    public function import(ImportCategoryProductRequest $request): RedirectResponse
    {
        try {
            $file = $request->file('file');
            $csvService = new CsvService();

            // Validate CSV headers
            if (!$csvService->validateHeaders($file, ImportCategoryProductRequest::getRequiredHeaders())) {
                $actualHeaders = $csvService->getHeaders($file);
                $message = 'Invalid CSV headers. Required: ' . implode(', ', ImportCategoryProductRequest::getRequiredHeaders()) . 
                          '. Found: ' . implode(', ', $actualHeaders);
                throw new Exception($message);
            }

            // Import CSV data
            $records = $csvService->import($file, ImportCategoryProductRequest::getHeaderMapping());

            $parentCategories = $this->categoryProductService->getAllWithoutPagination()
                ->pluck('uuid', 'name');
                
            $validator = app()->make(Factory::class);
            $rowNumber = 1;
            $successCount = 0;
            $errors = [];

            // dd($records)
            foreach ($records as $record) {
                $rowNumber++;
                
                // Prepare data for validation
                $data = [
                    'name' => $record['name'],
                    'description' => $record['description'],
                    'category_product_id' => null
                ];

                // If parent category is specified, find its UUID
                if (!empty($record['parent_category']) && !is_null($record['parent_category'])) {
                    $parentUuid = $parentCategories[$record['parent_category']] ?? null;
                    if (!$parentUuid) {
                        $errors[] = "Row {$rowNumber}: Parent category '{$record['parent_category']}' not found";
                        continue;
                    }
                    $data['category_product_id'] = $parentUuid;
                }

                // Get validation rules from ImportCategoryProductRequest
                $rules = ImportCategoryProductRequest::getRowValidationRules();

                $validation = $validator->make($data, $rules);

                if ($validation->fails()) {
                    $rowErrors = $validation->errors()->all();
                    $errors[] = "Row {$rowNumber}: " . implode(', ', $rowErrors);
                    continue;
                }

                try {
                    $dto = new CategoryProductDto();
                    $dto->name = $data['name'];
                    $dto->description = $data['description'];
                    $dto->category_product_id = $data['category_product_id'];

                    $this->categoryProductService->create($dto);
                    $successCount++;
                } catch (Exception $e) {
                    $errors[] = "Row {$rowNumber}: Failed to create category - " . $e->getMessage();
                }
            }

            // If there were any errors, throw an exception with details
            if (!empty($errors)) {
                $errorMessage = "Import completed with errors:\n" . implode("\n", $errors);
                if ($successCount > 0) {
                    $errorMessage .= "\n{$successCount} categories were imported successfully.";
                }
                throw new Exception($errorMessage);
            }

            return redirect()->back()
                ->with('success', __('common.import_success'));
        } catch (Exception $e) {
            return redirect()->back()
                ->withErrors(['error' => __('common.import_error') . ': ' . $e->getMessage()]);
        }
    }
}
