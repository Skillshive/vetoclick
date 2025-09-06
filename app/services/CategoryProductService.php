<?php

namespace App\Services;

use App\DTOs\Stock\CategoryProductDto;
use App\Models\CategoryProduct;
use App\Interfaces\ServiceInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Exception;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Str;

class CategoryProductService implements ServiceInterface
{
    public function query()
    {
        return CategoryProduct::with('parent_category');
    }

    public function getAll(int $perPage = 15): LengthAwarePaginator
    {
        return $this->query()->paginate($perPage);
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
            $createData = CategoryProduct::create([
                   'name' => $dto->name,
            'description' => $dto->description,
            'category_product_id' =>  $dto->category_product_id?$this->getByUuid($dto->category_product_id)?->id : null,
            ]);
            
            return $createData;
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

            $categoryProduct->update([
                   'name' => $dto->name,
            'description' => $dto->description,
            'category_product_id' =>  $this->getByUuid($dto->category_product_id)?->id ?? null,
            ]); ;
            
            return $categoryProduct->refresh();
        } catch (Exception $e) {
            throw new Exception("Failed to update category product");
        }
    }

    public function delete(string $uuid): bool
    {
        try {
            $categoryProduct = $this->getByUuid($uuid);
            
            if (!$categoryProduct) {
                return false;
            }

            // Only delete the exact category product with matching UUID
            return CategoryProduct::where('uuid', $uuid)->delete() > 0;
        } catch (Exception $e) {
            throw new Exception("Failed to delete category product");
        }
    }

    public function search(string $search, int $perPage = 15): LengthAwarePaginator
    {
        return CategoryProduct::with('parent_category')
            ->where('name', 'LIKE', "%{$search}%")
            ->orWhere('description', 'LIKE', "%{$search}%")
             ->orWhere(function($query) use ($search) {
                 $query->whereHas('parent_category', function($q) use ($search) {
                     $q->where('name', 'LIKE', "%{$search}%");
                 });
             })
            ->paginate($perPage);
    }

    public function getAllWithoutPagination(): Collection
    {
        return CategoryProduct::whereNull('category_product_id')->get();
    }
}
