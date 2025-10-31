<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Services\BlogService;
use App\DTOs\BlogDto;
use App\Http\Requests\Blog\BlogRequest;
use Illuminate\Http\Request;
use Exception;
use App\Models\CategoryBlog;
use App\Http\Resources\Blog\CategoryBlogResource;
use App\Http\Resources\Blog\BlogResource;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Validator;

class BlogController extends Controller
{
    protected BlogService $blogService;

    public function __construct(BlogService $blogService)
    {
        $this->blogService = $blogService;
    }

    /**
     * Get all blogs
     */
    public function index(Request $request): Response
    {
        try {
            $perPage = $request->input('per_page', 15);
            $search = $request->input('search');
            
            // Get blogs with search if provided
            if ($search) {
                $blogs = $this->blogService->searchByTitle($search, $perPage);
            } else {
                $blogs = $this->blogService->getAll($perPage);
            }

            // Get category blogs for filters
            $categoryBlogs = CategoryBlog::all();

            $categoryBlogsResource = CategoryBlogResource::collection($categoryBlogs);
            return Inertia::render('Blogs/blog/Index', [
                'blogs' => [
                    'data' => BlogResource::collection($blogs->items())->toArray(request()),
                    'meta' => [
                        'current_page' => $blogs->currentPage(),
                        'from' => $blogs->firstItem(),
                        'last_page' => $blogs->lastPage(),
                        'per_page' => $blogs->perPage(),
                        'to' => $blogs->lastItem(),
                        'total' => $blogs->total(),
                    ],
                    'links' => [
                        'first' => $blogs->url(1),
                        'last' => $blogs->url($blogs->lastPage()),
                        'prev' => $blogs->previousPageUrl(),
                        'next' => $blogs->nextPageUrl(),
                    ]
                ],
                'category_blogs' => $categoryBlogsResource->toArray(request()),
                'filters' => [
                    'search' => $search
                ]
            ]);
        } catch (Exception $e) {
            return Inertia::render('Blogs/blog/Index', [
                'error' => __('common.blog_retrieve_error'),
                'blogs' => null,
                'category_blogs' => [],
                'filters' => []
            ]);
        }
    }

    public function create(): Response
    {
        // Get category blogs for the form
        $categoryBlogs = CategoryBlog::all();

        $categoryBlogsResource = CategoryBlogResource::collection($categoryBlogs);
        return Inertia::render('Blogs/blog/Create', [
            'category_blogs' => $categoryBlogsResource->toArray(request())
        ]);
    }


    /**
     * Get blog by UUID
     */
    public function show(string $uuid): Response
    {
        try {
            $blog = $this->blogService->getByUuid($uuid);

            if (!$blog) {
                return Inertia::render('Blogs/blog/Show', [
                    'error' => __('common.blog_not_found')
                ]);
            }

            $blogResource = new BlogResource($blog);
            return Inertia::render('Blogs/blog/Show', [
                'blog' => $blogResource->toArray(request())
            ]);
        } catch (Exception $e) {
            return Inertia::render('Blogs/blog/Show', [
                'error' => __('common.blog_retrieve_error')
            ]);
        }
    }

    /**
     * Show the form for editing the specified blog
     */
    public function edit(string $uuid): Response
    {
        try {
            $blog = $this->blogService->getByUuid($uuid);

            if (!$blog) {
                return Inertia::render('Blogs/blog/Edit', [
                    'error' => __('common.blog_not_found')
                ]);
            }

            // Get category blogs for the form
            $categoryBlogs = CategoryBlog::all();
            $blogResource = new BlogResource($blog);
            $categoryBlogsResource = CategoryBlogResource::collection($categoryBlogs);
            return Inertia::render('Blogs/blog/Edit', [
                'blog' => $blogResource->toArray(request()),
                'category_blogs' => $categoryBlogsResource->toArray(request())
            ]);
        } catch (Exception $e) {
            return Inertia::render('Blogs/blog/Edit', [
                'error' => __('common.blog_retrieve_error')
            ]);
        }
    }

    /**
     * Create a new blog
     */
    public function store(BlogRequest $request)
    {
        try {
            $dto = BlogDto::fromRequest($request);
            $blog = $this->blogService->create($dto);

            return redirect()->route('blogs.index')->with('success', __('common.blog_created_success'));

        } catch (Exception $e) {
            return back()->with('error', __('common.blog_create_error'));
        }
    }

    /**
     * Update blog by UUID
     */
    public function update(BlogRequest $request, string $uuid)
    {
        try {
            $blog = $this->blogService->getByUuid($uuid);

            if (!$blog) {
                return back()->with('error', __('common.blog_not_found'));
            }

            $dto = BlogDto::fromRequest($request);
            $updatedBlog = $this->blogService->update($uuid, $dto);

            return redirect()->route('blogs.index')->with('success', __('common.blog_updated_success'));

        } catch (Exception $e) {
            return back()->with('error', __('common.blog_update_error') );
        }
    }

    /**
     * Delete blog by UUID
     */
    public function destroy(string $uuid)
    {
        try {
            $blog = $this->blogService->getByUuid($uuid);

            if (!$blog) {
                return back()->with('error', __('common.blog_not_found'));
            }

            $this->blogService->delete($uuid);

            return redirect()->route('blogs.index')->with('success', __('common.blog_deleted_success'));

        } catch (Exception $e) {
            return back()->with('error', __('common.blog_delete_error'));
        }
    }

    /**
     * Search blogs by title
     */
    public function search(Request $request): Response
    {
        try {
            $validator = Validator::make($request->all(), [
                'title' => 'required|string|min:1|max:255',
                'per_page' => 'nullable|integer|min:1|max:100'
            ]);

            if ($validator->fails()) {
                return Inertia::render('Blog/Index', [
                    'errors' => $validator->errors()
                ]);
            }

            $perPage = $request->input('per_page', 15);
            $blogs = $this->blogService->searchByTitle($request->title, $perPage);

            // Get category blogs for filters
            $categoryBlogs = CategoryBlog::all();
            $categoryBlogsResource = CategoryBlogResource::collection($categoryBlogs);
            return Inertia::render('Blog/Index', [
                'blogs' => [
                    'data' => BlogResource::collection($blogs->items())->toArray(request()),
                    'meta' => [
                        'current_page' => $blogs->currentPage(),
                        'from' => $blogs->firstItem(),
                        'last_page' => $blogs->lastPage(),
                        'per_page' => $blogs->perPage(),
                        'to' => $blogs->lastItem(),
                        'total' => $blogs->total(),
                    ],
                    'links' => [
                        'first' => $blogs->url(1),
                        'last' => $blogs->url($blogs->lastPage()),
                        'prev' => $blogs->previousPageUrl(),
                        'next' => $blogs->nextPageUrl(),
                    ]
                ],
                'category_blogs' => $categoryBlogsResource->toArray(request()),
                'filters' => [
                    'search' => $request->title
                ]
            ]);
        } catch (Exception $e) {
            return Inertia::render('Blog/Index', [
                'error' => __('common.blog_search_error')
            ]);
        }
    }

    public function apiIndex(Request $request)
    {
        try {
            $blogs = $this->blogService->getLatest(10);
            return BlogResource::collection($blogs);
        } catch (Exception $e) {
            return response()->json(['error' => __('common.blog_retrieve_error')], 500);
        }
    }
}
