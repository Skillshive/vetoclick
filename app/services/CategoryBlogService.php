<?php

namespace App\Services;

use App\Models\CategoryBlog;
use App\DTOs\CategoryBlogDto;
use App\Interfaces\ServiceInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Exception;

class CategoryBlogService implements ServiceInterface
{

        public function query()
    {
        return CategoryBlog::with('parentCategory');
    }
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
        return $this->query()->paginate($perPage);
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
          $categoryBlog=  CategoryBlog::create([
                "name" => $dto->name,
                "desp" => $dto->desp,
                "parent_category_id" => $dto->parent_category_id ? $this->getByUuid($dto->parent_category_id)->id : null,
          ]);

          return $categoryBlog->load(['parentCategory', 'childCategories']);
        } catch (Exception $e) {
            throw new Exception("Failed to create category blog");
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

            $categoryBlog->update([
                "name" => $dto->name,
                "desp" => $dto->desp,
                "parent_category_id" => $dto->parent_category_id ? $this->getByUuid($dto->parent_category_id)->id : null,
            ]);
            
            $categoryBlog->refresh();
            return $categoryBlog->fresh(['parentCategory', 'childCategories']);
        } catch (Exception $e) {
            throw new Exception("Failed to update category blog");
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
     */
    public function searchByName(string $searchTerm): Collection
    {
        return CategoryBlog::with(['parentCategory', 'childCategories'])
            ->where('name', 'LIKE', '%' . $searchTerm . '%')
             ->orWhere('dsep', 'LIKE', '%' . $searchTerm . '%')
            ->orWhereHas('parentCategory', function ($query) use ($searchTerm) {
                $query->where('name', 'LIKE', '%' . $searchTerm . '%')
                ->orWhere('dsep', 'LIKE', '%' . $searchTerm . '%');
            })
            ->get();
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
        return CategoryBlog::whereNull('parent_category_id')->get();
    }
    
    public function getAllForExport(): Collection
    {
        return CategoryBlog::get();
    }
}