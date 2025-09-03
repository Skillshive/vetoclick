<?php

namespace App\Services;

use App\Models\CategoryProduct;
use App\common\CategoryProductDto;
use App\Interfaces\ServiceInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Exception;
use Illuminate\Support\Str;

class CategoryProductService implements ServiceInterface
{
    public function getAll(int $perPage = 15): LengthAwarePaginator
    {
        return CategoryProduct::with('parent_category')->paginate($perPage);
    }

    public function getById(int $id): ?CategoryProduct
    {
        return CategoryProduct::with('parent_category')->find($id);
    }

    public function getByUuid(string $uuid): ?CategoryProduct
    {
        return CategoryProduct::with('parent_category')->where('uuid', $uuid)->first();
    }

    public function create(CategoryProductDto $dto): CategoryProduct
    {
        try {
            $createData = $dto->toCreateArray();
            $createData['uuid'] = Str::uuid();
            
            return CategoryProduct::create($createData);
        } catch (Exception $e) {
            throw new Exception("Failed to create category product: " . $e->getMessage());
        }
    }

    public function update(string $uuid, CategoryProductDto $dto): ?CategoryProduct
    {
        try {
            $categoryProduct = $this->getByUuid($uuid);
            
            if (!$categoryProduct) {
                return null;
            }

            $updateData = $dto->toUpdateArray();
            $categoryProduct->update($updateData);
            
            return $categoryProduct->fresh(['parent_category']);
        } catch (Exception $e) {
            throw new Exception("Failed to update category product: " . $e->getMessage());
        }
    }

    public function delete(string $uuid): bool
    {
        try {
            $categoryProduct = $this->getByUuid($uuid);
            
            if (!$categoryProduct) {
                return false;
            }

            return $categoryProduct->delete();
        } catch (Exception $e) {
            throw new Exception("Failed to delete category product: " . $e->getMessage());
        }
    }

    public function searchByName(string $name, int $perPage = 15): LengthAwarePaginator
    {
        return CategoryProduct::with('parent_category')
            ->where('name', 'LIKE', "%{$name}%")
            ->paginate($perPage);
    }
}
