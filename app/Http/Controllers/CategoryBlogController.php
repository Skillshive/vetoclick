<?php

namespace App\Http\Controllers;

use App\DTOs\CategoryBlogDto;
use App\Http\Requests\Blog\ImportCategoryBlogRequest;
use App\Services\CategoryBlogService;
use App\Http\Requests\CreateCategoryBlogRequest;
use App\Http\Requests\UpdateCategoryBlogRequest;
use App\Http\Resources\CategoryBlogResource;
use App\Models\CategoryBlog;
use App\Services\CsvService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;
use Exception;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Illuminate\Validation\Factory;

class CategoryBlogController extends Controller
{
    protected CategoryBlogService $categoryBlogService;

    public function __construct(CategoryBlogService $categoryBlogService)
    {
        $this->categoryBlogService = $categoryBlogService;
    }

    /**
     * Display a listing of category blogs
     */
    public function index(Request $request): Response
    {
        $perPage = $request->get('per_page', 10);
        $search = $request->get('search');
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $parentCategoryIds = $request->get('parent_category'); // Can be string or array
        $page = $request->get('page', 1);

        // Convert to array if it's a string
        if (is_string($parentCategoryIds)) {
            $parentCategoryIds = $parentCategoryIds ? [$parentCategoryIds] : [];
        } elseif (!is_array($parentCategoryIds)) {
            $parentCategoryIds = [];
        }

        try {
            $query = $this->categoryBlogService->query();

            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('desp', 'like', "%{$search}%");
                });
            }

            if (!empty($parentCategoryIds)) {
                $categoryIds = [];
                foreach ($parentCategoryIds as $parentCategoryId) {
                    $cat = $this->categoryBlogService->getByUuid($parentCategoryId);
                    if ($cat) {
                        $categoryIds[] = $cat->id;
                    }
                }
                if (!empty($categoryIds)) {
                    $query->whereIn('parent_category_id', $categoryIds);
                }
            }

            $categoryBlogs = $query->paginate($perPage, ['*'], 'page', $page);

            // Get all categories for parent selection
            $parentCategories = $this->categoryBlogService->getAllWithoutPagination();

            return Inertia::render('CategoryBlogs/Index', [
                'categoryBlogs' => [
                    'data' => CategoryBlogResource::collection($categoryBlogs->items()),
                    'meta' => [
                        'current_page' => $categoryBlogs->currentPage(),
                        'from' => $categoryBlogs->firstItem(),
                        'last_page' => $categoryBlogs->lastPage(),
                        'per_page' => $categoryBlogs->perPage(),
                        'to' => $categoryBlogs->lastItem(),
                        'total' => $categoryBlogs->total(),
                    ],
                    'links' => [
                        'first' => $categoryBlogs->url(1),
                        'last' => $categoryBlogs->url($categoryBlogs->lastPage()),
                        'prev' => $categoryBlogs->previousPageUrl(),
                        'next' => $categoryBlogs->nextPageUrl(),
                    ]
                ],
                'parentCategories' => CategoryBlogResource::collection($parentCategories),
                'filters' => [
                    'search' => $search,
                    'per_page' => $perPage,
                    'sort_by' => $sortBy,
                    'sort_direction' => $sortDirection,
                ],
                'old' => $request->old(),
                'errors' => $request->session()->get('errors')
            ]);
        } catch (Exception $e) {
            // Get parent categories even in error case
            $parentCategories = $this->categoryBlogService->getAllWithoutPagination();

            return Inertia::render('CategoryBlogs/Index', [
                'categoryBlogs' => [
                    'data' => ['data' => []],
                    'meta' => null,
                    'links' => null
                ],
                'parentCategories' => CategoryBlogResource::collection($parentCategories),
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
     * Store a newly created category blog
     */
    public function store(CreateCategoryBlogRequest $request): mixed
    {
        try {
            $dto = CategoryBlogDto::fromRequest($request);
            $this->categoryBlogService->create($dto);

            return response()->json(['success' => true, 'message' => __('common.category_blog_created')]);
        } catch (Exception $e) {
            return response()->json(['error' => __('common.error') . ': ' . $e->getMessage()], 500);
        }
    }

    /**
     * Update the specified category blog by UUID
     */
    public function update(UpdateCategoryBlogRequest $request, string $uuid): mixed
    {
        try {
            $dto = CategoryBlogDto::fromRequest($request);
            $categoryBlog = $this->categoryBlogService->update($uuid, $dto);

            if (!$categoryBlog) {
                return redirect()->back()
                    ->withErrors(['error' => __('common.category_blog_not_found')]);
            }

            return redirect()->route('category-blogs.index')
                ->with('success', __('common.category_blog_updated'));
        } catch (Exception $e) {
            return redirect()->back()
                ->withInput()
                ->withErrors(['error' => __('common.error') . ': ' . $e->getMessage()]);
        }
    }

    /**
     * Remove the specified category blog by UUID
     */
    public function destroy(string $uuid): RedirectResponse
    {
        try {
            $deleted = $this->categoryBlogService->delete($uuid);

            if (!$deleted) {
                return redirect()->back()
                    ->withErrors(['error' => __('common.category_blog_not_found')]);
            }

            return redirect()->route('category-blogs.index')
                ->with('success', __('common.category_blog_deleted'));
        } catch (Exception $e) {
            return redirect()->back()
                ->withErrors(['error' => __('common.error') . ': ' . $e->getMessage()]);
        }
    }

    // API Methods for AJAX requests
    /**
     * Get all category blogs (JSON response for AJAX)
     */
    public function apiIndex(Request $request): JsonResponse
    {
        try {
            $perPage = $request->input('per_page', 15);
            $categoryBlogs = $this->categoryBlogService->getAll($perPage);

            return response()->json([
                'success' => true,
                'data' => CategoryBlogResource::collection($categoryBlogs->items()),
                'pagination' => [
                    'current_page' => $categoryBlogs->currentPage(),
                    'last_page' => $categoryBlogs->lastPage(),
                    'per_page' => $categoryBlogs->perPage(),
                    'total' => $categoryBlogs->total()
                ]
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve category blogs',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get category blog by UUID (JSON response for AJAX)
     */
    public function apiShow(string $uuid): JsonResponse
    {
        try {
            $categoryBlog = $this->categoryBlogService->getByUuid($uuid);

            if (!$categoryBlog) {
                return response()->json([
                    'success' => false,
                    'message' => 'Category blog not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => new CategoryBlogResource($categoryBlog)
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve category blog',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Search categories by name
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

            $categories = $this->categoryBlogService->searchByName($searchTerm);

            return response()->json([
                'success' => true,
                'data' => CategoryBlogResource::collection($categories)
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to search categories',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all categories as collection (for dropdowns, etc.)
     */
    public function getAllAsCollection(): JsonResponse
    {
        try {
            $categories = $this->categoryBlogService->getAllAsCollection();

            return response()->json([
                'success' => true,
                'data' => CategoryBlogResource::collection($categories)
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve categories',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    

    /**
     * Export category products to CSV
     */
    public function export(): StreamedResponse|RedirectResponse
    {
        try {
            $categories = $this->categoryBlogService->getAllForExport();
            
            // dd($categories);
            $records = $categories->map(function ($category) {
                return [
                    'Name' => $category->name,
                    'Description' => $category->desp,
                    'Parent Category' => $category->parentCategory?->name ?? '',
                ];
            })->toArray();

            $csvService = new CsvService();
            return $csvService->export(
                ['Name', 'Description', 'Parent Category'],
                array_values($records), 
                'category-blogs.csv'
            );
        } catch (Exception $e) {
            return redirect()->back()
                ->withErrors(['error' => __('common.export_error')]);
        }
    }

    /**
     * Import category products from CSV
     */
    public function import(ImportCategoryBlogRequest $request): RedirectResponse
    {
        try {
            $file = $request->file('file');
            $csvService = new CsvService();

            // Validate CSV headers
            if (!$csvService->validateHeaders($file, ImportCategoryBlogRequest::getRequiredHeaders())) {
                $actualHeaders = $csvService->getHeaders($file);
                $message = 'Invalid CSV headers. Required: ' . implode(', ', ImportCategoryBlogRequest::getRequiredHeaders()) . 
                          '. Found: ' . implode(', ', $actualHeaders);
                throw new Exception($message);
            }

            // Import CSV data
            $records = $csvService->import($file, ImportCategoryBlogRequest::getHeaderMapping());

            $parentCategories = $this->categoryBlogService->getAllForExport()
                ->pluck('uuid', 'name');
                
            $validator = app()->make(Factory::class);
            $rowNumber = 1;
            $successCount = 0;
            $errors = [];
// dd($records);
            foreach ($records as $record) {
                $rowNumber++;
                
                // Prepare data for validation
                $data = [
                    'name' => $record['name'],
                    'description' => $record['description'],
                    'parent_category_id' => null
                ];

                // If parent category is specified, find its UUID
                if (!empty($record['parent_category']) && !is_null($record['parent_category'])) {
                    $parentUuid = $parentCategories[$record['parent_category']] ?? null;
                    if (!$parentUuid) {
                        $errors[] = "Row {$rowNumber}: Parent category '{$record['parent_category']}' not found";
                        continue;
                    }
                    $data['parent_category_id'] = $parentUuid;
                }

                // Get validation rules from ImportCategoryProductRequest
                $rules = ImportCategoryBlogRequest::getRowValidationRules();

                $validation = $validator->make($data, $rules);

                if ($validation->fails()) {
                    $rowErrors = $validation->errors()->all();
                    $errors[] = "Row {$rowNumber}: " . implode(', ', $rowErrors);
                    continue;
                }

                try {
                    $dto = new CategoryBlogDto();
                    $dto->name = $data['name'];
                    $dto->desp = $data['description'];
                    $dto->parent_category_id = $data['parent_category_id'];

                    $this->categoryBlogService->create($dto);
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
