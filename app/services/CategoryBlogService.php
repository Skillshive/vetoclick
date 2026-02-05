<?php

namespace App\Services;

use App\Models\CategoryBlog;
use App\DTOs\CategoryBlogDto;
use App\Interfaces\ServiceInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Exception;

class CategoryBlogService implements ServiceInterface
{
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

    public function query()
    {
        $vetUserId = $this->getVetUserId();
        
        $query = CategoryBlog::with('parentCategory');
        
        if ($vetUserId) {
            $query->where('vet_id', $vetUserId);
        }
        
        return $query;
    }
    /**
     * Get category blog by UUID
     * Filtered by the current vet's user ID (works for both veterinarians and receptionists)
     */
    public function getByUuid(string $uuid): ?CategoryBlog
    {
        $vetUserId = $this->getVetUserId();
        
        $query = CategoryBlog::with(['parentCategory', 'childCategories'])
            ->where('uuid', $uuid);
        
        if ($vetUserId) {
            $query->where('vet_id', $vetUserId);
        }
        
        return $query->first();
    }

    /**
     * Get all category blogs with pagination
     */
    public function getAll(int $perPage = 15): LengthAwarePaginator
    {
        return $this->query()->orderBy('created_at', 'desc')->paginate($perPage);
    }

    /**
     * Get all category blogs as collection
     * Filtered by the current vet's user ID (works for both veterinarians and receptionists)
     */
    public function getAllAsCollection(): Collection
    {
        $vetUserId = $this->getVetUserId();
        
        $query = CategoryBlog::with(['parentCategory', 'childCategories'])
            ->orderBy('created_at', 'desc');
        
        if ($vetUserId) {
            $query->where('vet_id', $vetUserId);
        }
        
        return $query->get();
    }

    /**
     * Create new category blog from DTO
     */
    public function create(CategoryBlogDto $dto): CategoryBlog
    {
        try {
            $vetUserId = $this->getVetUserId();
            
            // Validate parent category belongs to the same vet
            $parentCategoryId = null;
            if ($dto->parent_category_id) {
                $parentCategory = $this->getByUuid($dto->parent_category_id);
                if (!$parentCategory) {
                    throw new Exception("Parent category not found or does not belong to this vet");
                }
                $parentCategoryId = $parentCategory->id;
            }
            
            $categoryBlog =  CategoryBlog::create([
                  "name" => $dto->name,
                  "desp" => $dto->desp,
                  "parent_category_id" => $parentCategoryId,
                  "vet_id" => $vetUserId,
            ]);

            return $categoryBlog->load(['parentCategory', 'childCategories']);
        } catch (Exception $e) {
            throw new Exception("Failed to create category blog: " . $e->getMessage());
        }
    }


    /**
     * Update category blog by UUID
     */
    public function update(string $uuid, CategoryBlogDto $dto): ?CategoryBlog
    {
        try {
            $categoryBlog = $this->getByUuid($uuid);

            if (!$categoryBlog) {
                return null;
            }

            // Validate parent category belongs to the same vet
            $parentCategoryId = null;
            if ($dto->parent_category_id) {
                $parentCategory = $this->getByUuid($dto->parent_category_id);
                if (!$parentCategory) {
                    throw new Exception("Parent category not found or does not belong to this vet");
                }
                $parentCategoryId = $parentCategory->id;
            }

            $categoryBlog->update([
                "name" => $dto->name,
                "desp" => $dto->desp,
                "parent_category_id" => $parentCategoryId,
            ]);

            $categoryBlog->refresh();
            return $categoryBlog->fresh(['parentCategory', 'childCategories']);
        } catch (Exception $e) {
            throw new Exception("Failed to update category blog: " . $e->getMessage());
        }
    }

    /**
     * Delete category blog by UUID
     */
    public function delete(string $uuid): bool
    {
        try {
            $categoryBlog = $this->getByUuid($uuid);

            if (!$categoryBlog) {
                return false;
            }

            return $categoryBlog->delete();
        } catch (Exception $e) {
            throw new Exception("Failed to delete category blog");
        }
    }
    /**
     * Search categories by name
     * Filtered by the current vet's user ID (works for both veterinarians and receptionists)
     */
    public function searchByName(string $searchTerm): Collection
    {
        $vetUserId = $this->getVetUserId();
        
        $query = CategoryBlog::with(['parentCategory', 'childCategories'])
            ->where(function ($q) use ($searchTerm) {
                $q->where('name', 'LIKE', '%' . $searchTerm . '%')
                  ->orWhere('desp', 'LIKE', '%' . $searchTerm . '%');
            })
            ->orWhereHas('parentCategory', function ($query) use ($searchTerm) {
                $query->where('name', 'LIKE', '%' . $searchTerm . '%')
                ->orWhere('desp', 'LIKE', '%' . $searchTerm . '%');
            });
        
        if ($vetUserId) {
            $query->where('vet_id', $vetUserId);
        }
        
        return $query->get();
    }

    /**
     * Check if a category is descendant of another category
     */
    private function isDescendant(int $ancestorId, int $descendantId): bool
    {
        $descendant = CategoryBlog::find($descendantId);

        while ($descendant && $descendant->parent_category_id) {
            if ($descendant->parent_category_id === $ancestorId) {
                return true;
            }
            $descendant = CategoryBlog::find($descendant->parent_category_id);
        }

        return false;
    }

    public function getAllWithoutPagination(): Collection
    {
        $vetUserId = $this->getVetUserId();
        
        $query = CategoryBlog::whereNull('parent_category_id');
        
        if ($vetUserId) {
            $query->where('vet_id', $vetUserId);
        }
        
        return $query->get();
    }

    public function getAllForExport(): Collection
    {
        $vetUserId = $this->getVetUserId();
        
        $query = CategoryBlog::query();
        
        if ($vetUserId) {
            $query->where('vet_id', $vetUserId);
        }
        
        return $query->get();
    }
}
