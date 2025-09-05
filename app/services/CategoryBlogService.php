<?php

namespace App\Services;

use App\Models\CategoryBlog;
use App\DTOs\CategoryBlogDto;
use App\Interfaces\ServiceInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Exception;

class CategoryBlogService implements ServiceInterface
{
    /**
     * Get category blog by UUID
     */
    public function getByUuid(string $uuid): ?CategoryBlog
    {
        return CategoryBlog::with(['parentCategory', 'childCategories'])
            ->where('uuid', $uuid)
            ->first();
    }

    /**
     * Get all category blogs with pagination
     */
    public function getAll(int $perPage = 15): LengthAwarePaginator
    {
        return CategoryBlog::with(['parentCategory', 'childCategories'])
            ->orderBy('name', 'asc')
            ->paginate($perPage);
    }

    /**
     * Get all category blogs as collection
     */
    public function getAllAsCollection(): Collection
    {
        return CategoryBlog::with(['parentCategory', 'childCategories'])
            ->orderBy('name', 'asc')
            ->get();
    }

    /**
     * Create new category blog from DTO
     */
    public function create(CategoryBlogDto $dto): CategoryBlog
    {
        try {
            $this->validateCategoryBlogData($dto->toCreateArray());
            $categoryBlog = CategoryBlog::create($dto->toCreateArray());
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

            $updateData = $dto->toUpdateArray();
            $this->validateCategoryBlogData($updateData, $categoryBlog->id);
            
            $categoryBlog->update($updateData);
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

            // Check if category has child categories
            if ($categoryBlog->childCategories()->count() > 0) {
                throw new Exception("Cannot delete category blog with child categories.");
            }

            return $categoryBlog->delete();
        } catch (Exception $e) {
            throw new Exception("Failed to delete category blog: " . $e->getMessage());
        }
    }

    /**
     * Get root categories (categories without parent)
     */
    public function getRootCategories(): Collection
    {
        return CategoryBlog::with(['childCategories'])
            ->whereNull('parent_category_id')
            ->orderBy('name', 'asc')
            ->get();
    }

    /**
     * Get child categories by parent UUID
     */
    public function getChildCategories(string $parentUuid): Collection
    {
        $parentCategory = $this->getByUuid($parentUuid);
        
        if (!$parentCategory) {
            return collect();
        }

        return CategoryBlog::with(['childCategories'])
            ->where('parent_category_id', $parentCategory->id)
            ->orderBy('name', 'asc')
            ->get();
    }

    /**
     * Get category hierarchy (tree structure)
     */
    public function getCategoryHierarchy(): Collection
    {
        $rootCategories = $this->getRootCategories();
        
        return $rootCategories->map(function ($category) {
            return $this->buildCategoryTree($category);
        });
    }

    /**
     * Build category tree recursively
     */
    private function buildCategoryTree(CategoryBlog $category): array
    {
        $categoryData = [
            'uuid' => $category->uuid,
            'name' => $category->name,
            'desp' => $category->desp,
            'parent_category_id' => $category->parent_category_id,
            'created_at' => $category->created_at,
            'updated_at' => $category->updated_at,
            'children' => []
        ];

        foreach ($category->childCategories as $child) {
            $categoryData['children'][] = $this->buildCategoryTree($child);
        }

        return $categoryData;
    }

    /**
     * Search categories by name
     */
    public function searchByName(string $searchTerm): Collection
    {
        return CategoryBlog::with(['parentCategory', 'childCategories'])
            ->where('name', 'LIKE', '%' . $searchTerm . '%')
            ->orderBy('name', 'asc')
            ->get();
    }

    /**
     * Check if category can be parent of another category (prevent circular reference)
     */
    public function canBeParent(int $categoryId, int $potentialParentId): bool
    {
        if ($categoryId === $potentialParentId) {
            return false;
        }

        $category = CategoryBlog::find($categoryId);
        if (!$category) {
            return false;
        }

        // Check if potential parent is a descendant of the category
        return !$this->isDescendant($categoryId, $potentialParentId);
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

    /**
     * Validate category blog data
     */
    protected function validateCategoryBlogData(array $data, ?int $excludeId = null): void
    {
        // Validate parent category relationship
        if (isset($data['parent_category_id']) && $data['parent_category_id']) {
            $parentCategory = CategoryBlog::find($data['parent_category_id']);
            if (!$parentCategory) {
                throw new Exception('Parent category does not exist.');
            }

            // Prevent circular reference if updating existing category
            if ($excludeId && !$this->canBeParent($excludeId, $data['parent_category_id'])) {
                throw new Exception('Cannot set parent category: circular reference detected.');
            }
        }

        // Validate name uniqueness
        if (isset($data['name'])) {
            $query = CategoryBlog::where('name', $data['name']);
            if ($excludeId) {
                $query->where('id', '!=', $excludeId);
            }
            
            if ($query->exists()) {
                throw new Exception('Category blog name must be unique.');
            }
        }
    }

    /**
     * Get categories with their blog count (if you have a blogs relationship)
     */
    public function getCategoriesWithBlogCount(): Collection
    {
        return CategoryBlog::with(['parentCategory'])
            ->orderBy('name', 'asc')
            ->get();
    }
}