<?php

namespace App\Services;

use App\Models\ProductCategory;
use App\common\ProductCategoryDto;
use App\Interfaces\ServiceInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Exception;
use Illuminate\Support\Str;

class ProductCategoryService implements ServiceInterface
{
    public function getAll(int $perPage = 15): LengthAwarePaginator
    {
        return ProductCategory::with('parent', 'children')->orderBy('created_at', 'desc')->paginate($perPage);
    }

    public function getById(int $id): ?ProductCategory
    {
        return ProductCategory::with('parent', 'children')->find($id);
    }

    public function create(ProductCategoryDto $dto): ProductCategory
    {
        try {
            $createData = $dto->toCreateArray();
            $createData['uuid'] = Str::uuid();
            return ProductCategory::create($createData);
        } catch (Exception $e) {
            throw new Exception("Failed to create product category: " . $e->getMessage());
        }
    }

    public function update(int $id, ProductCategoryDto $dto): ?ProductCategory
    {
        try {
            $category = $this->getById($id);
            
            if (!$category) {
                return null;
            }

            $updateData = $dto->toUpdateArray();

            if (empty($updateData)) {
                return $category;
            }

            $category->update($updateData);
            return $category->fresh();
        } catch (Exception $e) {
            throw new Exception("Failed to update product category: " . $e->getMessage());
        }
    }

    public function delete(int $id): bool
    {
        try {
            $category = $this->getById($id);
            
            if (!$category) {
                return false;
            }

            return $category->delete();
        } catch (Exception $e) {
            throw new Exception("Failed to delete product category: " . $e->getMessage());
        }
    }
}
