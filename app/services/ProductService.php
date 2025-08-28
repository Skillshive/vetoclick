<?php

namespace App\Services;

use App\Models\Product;
use App\common\ProductDto;
use App\Interfaces\ServiceInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Exception;
use Illuminate\Support\Str;

class ProductService implements ServiceInterface
{
    public function getAll(int $perPage = 15): LengthAwarePaginator
    {
        return Product::with('category')->paginate($perPage);
    }

    public function getById(int $id): ?Product
    {
        return Product::with('category')->find($id);
    }

    public function create(ProductDto $dto): Product
    {
        try {
            $createData = $dto->toCreateArray();
            $createData['uuid'] = Str::uuid();
            return Product::create($createData);
        } catch (Exception $e) {
            throw new Exception("Failed to create product: " . $e->getMessage());
        }
    }

    public function update(int $id, ProductDto $dto): ?Product
    {
        try {
            $product = $this->getById($id);
            
            if (!$product) {
                return null;
            }

            $updateData = $dto->toUpdateArray();

            if (empty($updateData)) {
                return $product;
            }

            $product->update($updateData);
            return $product->fresh();
        } catch (Exception $e) {
            throw new Exception("Failed to update product: " . $e->getMessage());
        }
    }

    public function delete(int $id): bool
    {
        try {
            $product = $this->getById($id);
            
            if (!$product) {
                return false;
            }

            return $product->delete();
        } catch (Exception $e) {
            throw new Exception("Failed to delete product: " . $e->getMessage());
        }
    }

    public function search(string $term, int $perPage = 15): LengthAwarePaginator
    {
        return Product::with('category')
            ->where('name', 'LIKE', "%{$term}%")
            ->orWhere('sku', 'LIKE', "%{$term}%")
            ->paginate($perPage);
    }
}
