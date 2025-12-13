<?php

namespace App\Services;

use App\Models\Product;
use App\DTOs\ProductDto;
use App\Enums\ProductType;
use App\Interfaces\ServiceInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class ProductService implements ServiceInterface
{
    public function getAll(int $perPage = 15): LengthAwarePaginator
    {
        return Product::with('category')->orderBy('created_at', 'desc')->paginate($perPage);
    }

    public function getAllWithoutPagination(): Collection
    {
        return Product::with('category')->orderBy('created_at', 'desc')->get();
    }

    public function getAllAsCollection(): Collection
    {
        return Product::with('category')->where('type',ProductType::MEDICATION->value)->where('is_active', true)->orderBy('created_at', 'desc')->get();
    }

    public function getAllForExport(): Collection
    {
        return Product::with('category')->orderBy('created_at', 'desc')->get();
    }

    public function getById(int $id): ?Product
    {
        return Product::with('category')->find($id);
    }

    public function getByUuid(string $uuid): ?Product
    {
        return Product::with('category')->where('uuid', $uuid)->first();
    }

    public function query()
    {
        return Product::with('category');
    }

    public function create(ProductDto $dto): Product
    {
        try {
            $product = Product::create([
                'uuid' => Str::uuid(),
                'name' => $dto->name,
                'sku' => $dto->sku,
                'category_product_id' => $dto->category_product_id,
                'brand' => $dto->brand,
                'description' => $dto->description,
                'barcode' => $dto->barcode,
                'type' => $dto->type,
                'dosage_form' => $dto->dosage_form,
                'target_species' => $dto->target_species ? json_encode($dto->target_species) : null,
                'administration_route' => $dto->administration_route,
                'prescription_required' => $dto->prescription_required,
                'minimum_stock_level' => $dto->minimum_stock_level,
                'maximum_stock_level' => $dto->maximum_stock_level,
                'is_active' => $dto->is_active,
                'availability_status' => $dto->availability_status,
                'notes' => $dto->notes,
                'image_id' => $dto->image_id,
                'manufacturer' => $dto->manufacturer,
                'batch_number' => $dto->batch_number,
                'expiry_date' => $dto->expiry_date,
                'dosage_ml' => $dto->dosage_ml,
                'vaccine_instructions' => $dto->vaccine_instructions,
                'veterinarian_id' => Auth::user()->veterinary->id,
            ]);
            
            return $product;
        } catch (Exception $e) {
            throw new Exception("Failed to create product: " . $e->getMessage());
        }
    }

    public function update(string $uuid, ProductDto $dto): ?Product
    {
        try {
            $product = $this->getByUuid($uuid);
            
            if (!$product) {
                return null;
            }

            $updateData = array_filter([
                'name' => $dto->name,
                'sku' => $dto->sku,
                'category_product_id' => $dto->category_product_id,
                'brand' => $dto->brand,
                'description' => $dto->description,
                'barcode' => $dto->barcode,
                'type' => $dto->type,
                'dosage_form' => $dto->dosage_form,
                'target_species' => $dto->target_species ? json_encode($dto->target_species) : null,
                'administration_route' => $dto->administration_route,
                'prescription_required' => $dto->prescription_required,
                'minimum_stock_level' => $dto->minimum_stock_level,
                'maximum_stock_level' => $dto->maximum_stock_level,
                'is_active' => $dto->is_active,
                'availability_status' => $dto->availability_status,
                'notes' => $dto->notes,
                'image_id' => $dto->image_id,
                'manufacturer' => $dto->manufacturer,
                'batch_number' => $dto->batch_number,
                'expiry_date' => $dto->expiry_date,
                'dosage_ml' => $dto->dosage_ml,
                'vaccine_instructions' => $dto->vaccine_instructions,
                'veterinarian_id' => Auth::user()->veterinary->id,
            ], function($value, $key) {
                // Keep boolean values (including false) and numeric values (including 0)
                if (is_bool($value) || is_numeric($value)) {
                    return true;
                }
                // Remove null values and empty strings (to preserve existing DB values)
                return $value !== null && $value !== '';
            }, ARRAY_FILTER_USE_BOTH);
            
            $product->update($updateData);
            
            return $product->fresh();
        } catch (Exception $e) {
            throw new Exception("Failed to update product: " . $e->getMessage());
        }
    }

    public function delete(string $uuid): bool
    {
        try {
            $product = $this->getByUuid($uuid);
            
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
            ->orWhere('barcode', 'LIKE', "%{$term}%")
            ->paginate($perPage);
    }

    public function searchByName(string $term): Collection
    {
        return Product::with('category')
            ->where('name', 'LIKE', "%{$term}%")
            ->get();
    }
}
