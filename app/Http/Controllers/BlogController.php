<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Services\BlogService;
use App\DTOs\BlogDto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Exception;
use Inertia\Inertia;
use Inertia\Response;

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
            $blogs = $this->blogService->getAll($perPage);

            return Inertia::render('Blog/Index', [
                'blogs' => $blogs->map(function ($blog) {
                    return $blog->toArray();
                })
            ]);
        } catch (Exception $e) {
            return Inertia::render('Blog/Index', [
                'error' => 'Failed to retrieve blogs: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Get blog by UUID
     */
    public function show(string $uuid): Response
    {
        try {
            $blog = $this->blogService->getByUuid($uuid);

            if (!$blog) {
                return Inertia::render('Blog/Show', [
                    'error' => 'Blog not found'
                ]);
            }

            return Inertia::render('Blog/Show', [
                'blog' => $blog->toArray()
            ]);
        } catch (Exception $e) {
            return Inertia::render('Blog/Show', [
                'error' => 'Failed to retrieve blog: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Create a new blog
     */
    public function store(Request $request): Response
    {
        try {
            $validator = Validator::make($request->all(), [
                'title' => 'required|string|max:255',
                'body' => 'required|string',
                'caption' => 'required|string|max:255',
                'image_id' => 'nullable|integer|exists:images,id',
                'meta_title' => 'required|string|max:255',
                'meta_desc' => 'required|string',
                'meta_keywords' => 'required|string|max:255',
                'category_blog_id' => 'required|integer|exists:category_blogs,id',
                'tags' => 'nullable|string|max:255'
            ]);

            if ($validator->fails()) {
                return Inertia::render('Blog/Create', [
                    'errors' => $validator->errors()
                ]);
            }

            $dto = BlogDto::fromRequest($request);
            $blog = $this->blogService->create($dto);

            return Inertia::render('Blog/Show', [
                'blog' => $blog->toArray(),
                'message' => 'Blog created successfully'
            ]);

        } catch (Exception $e) {
            return Inertia::render('Blog/Create', [
                'error' => 'Failed to create blog: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Update blog by UUID
     */
    public function update(Request $request, string $uuid): Response
    {
        try {
            $blog = $this->blogService->getByUuid($uuid);

            if (!$blog) {
                return Inertia::render('Blog/Edit', [
                    'error' => 'Blog not found'
                ]);
            }

            $validator = Validator::make($request->all(), [
                'title' => 'sometimes|string|max:255',
                'body' => 'sometimes|string',
                'caption' => 'sometimes|string|max:255',
                'image_id' => 'nullable|integer|exists:images,id',
                'meta_title' => 'sometimes|string|max:255',
                'meta_desc' => 'sometimes|string',
                'meta_keywords' => 'sometimes|string|max:255',
                'category_blog_id' => 'sometimes|integer|exists:category_blogs,id',
                'tags' => 'nullable|string|max:255'
            ]);

            if ($validator->fails()) {
                return Inertia::render('Blog/Edit', [
                    'errors' => $validator->errors(),
                    'blog' => $blog->toArray()
                ]);
            }

            $dto = BlogDto::fromRequest($request);
            $updatedBlog = $this->blogService->update($uuid, $dto);

            return Inertia::render('Blog/Show', [
                'blog' => $updatedBlog->toArray(),
                'message' => 'Blog updated successfully'
            ]);

        } catch (Exception $e) {
            return Inertia::render('Blog/Edit', [
                'error' => 'Failed to update blog: ' . $e->getMessage(),
                'blog' => $blog->toArray()
            ]);
        }
    }

    /**
     * Delete blog by UUID
     */
    public function destroy(string $uuid): Response
    {
        try {
            $blog = $this->blogService->getByUuid($uuid);

            if (!$blog) {
                return Inertia::render('Blog/Index', [
                    'error' => 'Blog not found'
                ]);
            }

            $this->blogService->delete($uuid);

            return Inertia::render('Blog/Index', [
                'message' => 'Blog deleted successfully'
            ]);

        } catch (Exception $e) {
            return Inertia::render('Blog/Index', [
                'error' => 'Failed to delete blog: ' . $e->getMessage()
            ]);
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

            return Inertia::render('Blog/Index', [
                'blogs' => $blogs->map(function ($blog) {
                    return $blog->toArray();
                })
            ]);
        } catch (Exception $e) {
            return Inertia::render('Blog/Index', [
                'error' => 'Failed to search blogs: ' . $e->getMessage()
            ]);
        }
    }
}