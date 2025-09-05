<?php

namespace App\Http\Controllers;

use App\DTOs\CategoryBlogDto;
use App\Services\CategoryBlogService;
use App\Http\Requests\CreateCategoryBlogRequest;
use App\Http\Requests\UpdateCategoryBlogRequest;
use App\Http\Resources\CategoryBlogResource;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;
use Exception;

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
        $perPage = $request->get('per_page', 15);
        $search = $request->get('search');
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');

        try {
            if ($search) {
                $categoryBlogs = $this->categoryBlogService->searchByName($search);
                // Convert collection to paginator for consistency
                $categoryBlogs = new \Illuminate\Pagination\LengthAwarePaginator(
                    $categoryBlogs->forPage(1, $perPage),
                    $categoryBlogs->count(),
                    $perPage,
                    1,
                    ['path' => request()->url()]
                );
            } else {
                $categoryBlogs = $this->categoryBlogService->getAll($perPage);
            }

            // Get all categories for parent selection
            $parentCategories = $this->categoryBlogService->getAllAsCollection();

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
                ]
            ]);
        } catch (Exception $e) {
            return Inertia::render('CategoryBlogs/Index', [
                'categoryBlogs' => ['data' => [], 'meta' => null, 'links' => null],
                'parentCategories' => [],
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
    public function store(CreateCategoryBlogRequest $request): RedirectResponse
    {
        try {
            $dto = CategoryBlogDto::fromRequest($request);
            $this->categoryBlogService->create($dto);

            return redirect()->route('category-blogs.index')
                ->with('success', __('common.category_blog_created'));
        } catch (Exception $e) {
            return redirect()->back()
                ->withInput()
                ->withErrors(['error' => __('common.error') . ': ' . $e->getMessage()]);
        }
    }

    /**
     * Update the specified category blog by UUID
     */
    public function update(UpdateCategoryBlogRequest $request, string $uuid): RedirectResponse
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
     * Get root categories (categories without parent)
     */
    public function getRootCategories(): JsonResponse
    {
        try {
            $rootCategories = $this->categoryBlogService->getRootCategories();
            
            return response()->json([
                'success' => true,
                'data' => CategoryBlogResource::collection($rootCategories)
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve root categories',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get child categories by parent UUID
     */
    public function getChildCategories(string $parentUuid): JsonResponse
    {
        try {
            $childCategories = $this->categoryBlogService->getChildCategories($parentUuid);
            
            return response()->json([
                'success' => true,
                'data' => CategoryBlogResource::collection($childCategories)
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve child categories',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get category hierarchy (tree structure)
     */
    public function getCategoryHierarchy(): JsonResponse
    {
        try {
            $hierarchy = $this->categoryBlogService->getCategoryHierarchy();
            
            return response()->json([
                'success' => true,
                'data' => $hierarchy
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve category hierarchy',
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
}