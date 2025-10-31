<?php

namespace App\Services;

use App\DTOs\BlogDto;
use App\Models\Blog;
use App\Interfaces\ServiceInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Exception;

class BlogService implements ServiceInterface
{
        protected ImageService $imageService;

    public function __construct(ImageService $imageService)
    {
        $this->imageService = $imageService;
    }
    /**
     * Get all blogs with optional pagination
     */
    public function getAll(int $perPage = 15): LengthAwarePaginator
    {
        return Blog::with(['image', 'categoryBlog'])->paginate($perPage);
    }

    /**
     * Get blog by ID
     */
    public function getById(int $id): ?Blog
    {
        return Blog::with(['image', 'categoryBlog'])->find($id);
    }

    /**
     * Get blog by UUID
     */
    public function getByUuid(string $uuid): ?Blog
    {
        return Blog::with(['image', 'categoryBlog'])
                 ->where('uuid', $uuid)
                 ->first();
    }

    /**
     * Create new blog from DTO
     */
    public function create(BlogDto $dto): Blog
    {
        try {
            if($dto->image_file) {
                $image = $this->imageService->saveImage($dto->image_file, 'blogs/');
                $image_id = $image->id;
            } else {
                $image_id = null;
            }
            $blog = Blog::create(
                [
                    'title' => $dto->title,
                    'body' => $dto->body,
                    'caption' => $dto->caption,
                    'image_id' => $image_id,
                    'meta_title' => $dto->meta_title,
                    'meta_desc' => $dto->meta_desc,
                    'meta_keywords' => $dto->meta_keywords,
                    'category_blog_id' => $dto->category_blog_id,
                    'tags' => $dto->tags,
                ]
            );

            return $blog->load(['image', 'categoryBlog']);
        } catch (Exception $e) {
            throw new Exception("Failed to create blog: " . $e->getMessage());
        }
    }

    /**
     * Update blog by UUID from DTO
     */
    public function update(string $uuid, BlogDto $dto): ?Blog
    {
        try {
            $blog = $this->getByUuid($uuid);

            if (!$blog) {
                return null;
            }

          if($dto->image_file) {
                $image = $this->imageService->saveImage($dto->image_file, 'blogs/');
                $image_id = $image->id;
            } else {
                $image_id = null;
            }
            $blog->update(
                [
                    'title' => $dto->title,
                    'body' => $dto->body,
                    'caption' => $dto->caption,
                    'image_id' => $image_id,
                    'meta_title' => $dto->meta_title,
                    'meta_desc' => $dto->meta_desc,
                    'meta_keywords' => $dto->meta_keywords,
                    'category_blog_id' => $dto->category_blog_id,
                    'tags' => $dto->tags,
                ]
            );
            return $blog->refresh();
        } catch (Exception $e) {
            throw new Exception("Failed to update blog: " . $e->getMessage());
        }
    }

    /**
     * Delete blog by UUID
     */
    public function delete(string $uuid): bool
    {
        try {
            $blog = $this->getByUuid($uuid);

            if (!$blog) {
                return false;
            }

            return $blog->delete();
        } catch (Exception $e) {
            throw new Exception("Failed to delete blog: " . $e->getMessage());
        }
    }

    /**
     * Search blogs by title
     */
    public function searchByTitle(string $title, int $perPage = 15): LengthAwarePaginator
    {
        return Blog::with(['image', 'categoryBlog'])
            ->where('title', 'LIKE', "%{$title}%")
            ->paginate($perPage);
    }

    public function getByCategoryId(int $categoryId, int $perPage = 15): LengthAwarePaginator
    {
        return Blog::with(['image', 'categoryBlog'])
            ->where('category_blog_id', $categoryId)
            ->paginate($perPage);
    }

    /**
     * Get the latest blogs.
     */
    public function getLatest(int $limit = 10): Collection
    {
        return Blog::with(['image', 'categoryBlog'])
            ->latest()
            ->take($limit)
            ->get();
    }
}