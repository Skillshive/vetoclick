<?php

namespace App\Services;

use App\DTOs\BlogDto;
use App\Models\Blog;
use App\Interfaces\ServiceInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
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
     * Filtered by the current vet's user ID (works for both veterinarians and receptionists)
     */
    public function getAll(int $perPage = 15): LengthAwarePaginator
    {
        $vetUserId = $this->getVetUserId();
        
        $query = Blog::with(['image', 'categoryBlog', 'author'])->orderBy('created_at', 'desc');
        
        if ($vetUserId) {
            $query->where('author_id', $vetUserId);
        }
        
        return $query->paginate($perPage);
    }

    /**
     * Get blog by ID
     * Filtered by the current vet's user ID (works for both veterinarians and receptionists)
     */
    public function getById(int $id): ?Blog
    {
        $vetUserId = $this->getVetUserId();
        
        $query = Blog::with(['image', 'categoryBlog', 'author'])->where('id', $id);
        
        if ($vetUserId) {
            $query->where('author_id', $vetUserId);
        }
        
        return $query->first();
    }

    /**
     * Get blog by UUID
     * Filtered by the current vet's user ID (works for both veterinarians and receptionists)
     */
    public function getByUuid(string $uuid): ?Blog
    {
        $vetUserId = $this->getVetUserId();
        
        $query = Blog::with(['image', 'categoryBlog', 'author'])
                 ->where('uuid', $uuid);
        
        if ($vetUserId) {
            $query->where('author_id', $vetUserId);
        }
        
        return $query->first();
    }

    /**
     * Get the vet's user ID for the current authenticated user
     * - If user is a veterinarian, return their own user ID
     * - If user is a receptionist, return the veterinary's user ID they work for
     */
    private function getVetUserId(): ?int
    {
        $user = Auth::user();
        if (!$user) {
            return null;
        }

        $veterinary = $user->scopedVeterinary();
        if ($veterinary) {
            return $veterinary->user_id;
        }

        return null;
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

            $vetUserId = $this->getVetUserId();

            // Validate that the category belongs to the vet
            if ($dto->category_blog_id && $vetUserId) {
                $categoryBlog = \App\Models\CategoryBlog::where('id', $dto->category_blog_id)
                    ->where('vet_id', $vetUserId)
                    ->first();
                
                if (!$categoryBlog) {
                    throw new Exception("Category does not belong to this vet");
                }
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
                    'is_published' => $dto->is_published,
                    'is_featured' => $dto->is_featured,
                    'publish_date' => $dto->publish_date,
                    'reading_time' => $dto->reading_time,
                    'author_id' => $vetUserId,
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

          // Handle image update
            $vetUserId = $this->getVetUserId();

            // Validate that the category belongs to the vet
            if ($dto->category_blog_id && $vetUserId) {
                $categoryBlog = \App\Models\CategoryBlog::where('id', $dto->category_blog_id)
                    ->where('vet_id', $vetUserId)
                    ->first();
                
                if (!$categoryBlog) {
                    throw new Exception("Category does not belong to this vet");
                }
            }

            $updateData = [
                'title' => $dto->title,
                'body' => $dto->body,
                'caption' => $dto->caption,
                'meta_title' => $dto->meta_title,
                'meta_desc' => $dto->meta_desc,
                'meta_keywords' => $dto->meta_keywords,
                'category_blog_id' => $dto->category_blog_id,
                'tags' => $dto->tags,
                'is_published' => $dto->is_published,
                'is_featured' => $dto->is_featured,
                'publish_date' => $dto->publish_date,
                'reading_time' => $dto->reading_time,
            ];

            // Update author_id if vet user ID is available
            if ($vetUserId) {
                $updateData['author_id'] = $vetUserId;
            }

            if ($dto->image_file) {
                // New image uploaded
                $image = $this->imageService->saveImage($dto->image_file, 'blogs/');
                $updateData['image_id'] = $image->id;
            } elseif ($dto->remove_existing_image) {
                // User explicitly removed the image
                $updateData['image_id'] = null;
            }
            // If neither condition is met, don't update image_id (keep existing image)

            $blog->update($updateData);
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
     * Filtered by the current vet's user ID (works for both veterinarians and receptionists)
     */
    public function searchByTitle(string $title, int $perPage = 15): LengthAwarePaginator
    {
        $vetUserId = $this->getVetUserId();
        
        $query = Blog::with(['image', 'categoryBlog', 'author'])
            ->where('title', 'LIKE', "%{$title}%")
            ->orderBy('created_at', 'desc');
        
        if ($vetUserId) {
            $query->where('author_id', $vetUserId);
        }
        
        return $query->paginate($perPage);
    }

    public function getByCategoryId(int $categoryId, int $perPage = 15): LengthAwarePaginator
    {
        $vetUserId = $this->getVetUserId();
        
        $query = Blog::with(['image', 'categoryBlog', 'author'])
            ->where('category_blog_id', $categoryId)
            ->orderBy('created_at', 'desc');
        
        if ($vetUserId) {
            $query->where('author_id', $vetUserId);
        }
        
        return $query->paginate($perPage);
    }

    /**
     * Get the latest blogs.
     * Filtered by the current vet's user ID (works for both veterinarians and receptionists)
     */
    public function getLatest(int $limit = 10): Collection
    {
        $vetUserId = $this->getVetUserId();
        
        $query = Blog::with(['image', 'categoryBlog', 'author'])
            ->latest();
        
        if ($vetUserId) {
            $query->where('author_id', $vetUserId);
        }
        
        return $query->take($limit)->get();
    }

    /**
     * Get related blogs by category (excluding current blog)
     * Filtered by the current vet's user ID (works for both veterinarians and receptionists)
     */
    public function getRelatedByCategory(int $categoryId, string $excludeUuid, int $limit = 3): Collection
    {
        $vetUserId = $this->getVetUserId();
        
        $query = Blog::with(['image', 'categoryBlog', 'author'])
            ->where('category_blog_id', $categoryId)
            ->where('uuid', '!=', $excludeUuid)
            ->latest();
        
        if ($vetUserId) {
            $query->where('author_id', $vetUserId);
        }
        
        return $query->take($limit)->get();
    }

    /**
     * Get previous blog (older than current)
     * Filtered by the current vet's user ID (works for both veterinarians and receptionists)
     */
    public function getPrevious(string $currentUuid): ?Blog
    {
        $currentBlog = $this->getByUuid($currentUuid);
        if (!$currentBlog) {
            return null;
        }

        $vetUserId = $this->getVetUserId();
        
        $query = Blog::with(['image', 'categoryBlog', 'author'])
            ->where('created_at', '<', $currentBlog->created_at)
            ->orderBy('created_at', 'desc');
        
        if ($vetUserId) {
            $query->where('author_id', $vetUserId);
        }
        
        return $query->first();
    }

    /**
     * Get next blog (newer than current)
     * Filtered by the current vet's user ID (works for both veterinarians and receptionists)
     */
    public function getNext(string $currentUuid): ?Blog
    {
        $currentBlog = $this->getByUuid($currentUuid);
        if (!$currentBlog) {
            return null;
        }

        $vetUserId = $this->getVetUserId();
        
        $query = Blog::with(['image', 'categoryBlog', 'author'])
            ->where('created_at', '>', $currentBlog->created_at)
            ->orderBy('created_at', 'asc');
        
        if ($vetUserId) {
            $query->where('author_id', $vetUserId);
        }
        
        return $query->first();
    }
}