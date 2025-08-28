<?php

namespace App\Services;

use App\Models\Supplier;
use App\common\SupplierDto;
use App\Interfaces\ServiceInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Exception;

class SupplierService implements ServiceInterface
{
    /**
     * Get all suppliers with optional pagination
     */
    public function getAll(int $perPage = 15): LengthAwarePaginator
    {
        return Supplier::paginate($perPage);
    }

    /**
     * Get supplier by ID
     */
    public function getById(int $id): ?Supplier
    {
        return Supplier::find($id);
    }

    /**
     * Create new supplier from DTO
     */
    public function create(SupplierDto $dto): Supplier
    {
        try {
            $supplier = Supplier::create($dto->toCreateArray());
            return $supplier;
        } catch (Exception $e) {
            throw new Exception("Failed to create supplier: " . $e->getMessage());
        }
    }

    /**
     * Update supplier by ID from DTO
     */
    public function update(int $id, SupplierDto $dto): ?Supplier
    {
        try {
            $supplier = $this->getById($id);
            
            if (!$supplier) {
                return null;
            }

            $updateData = $dto->toUpdateArray();
            
            if (empty($updateData)) {
                return $supplier;
            }

            $supplier->update($updateData);
            return $supplier->fresh();
        } catch (Exception $e) {
            throw new Exception("Failed to update supplier: " . $e->getMessage());
        }
    }

    /**
     * Delete supplier by ID
     */
    public function delete(int $id): bool
    {
        try {
            $supplier = $this->getById($id);
            
            if (!$supplier) {
                return false;
            }

            return $supplier->delete();
        } catch (Exception $e) {
            throw new Exception("Failed to delete supplier: " . $e->getMessage());
        }
    }

    /**
     * Search suppliers by name
     */
    public function searchByName(string $name, int $perPage = 15): LengthAwarePaginator
    {
        return Supplier::where('name', 'LIKE', "%{$name}%")
            ->paginate($perPage);
    }
}