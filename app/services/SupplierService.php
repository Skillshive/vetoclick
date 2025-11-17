<?php

namespace App\Services;

use App\Models\Supplier;
use App\common\SupplierDto;
use App\Interfaces\ServiceInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Exception;

class SupplierService implements ServiceInterface
{
    public function query()
    {
        return Supplier::query();
    }

    /**
     * Get all suppliers with optional pagination
     */
    public function getAll(int $perPage = 15): LengthAwarePaginator
    {
        return Supplier::orderBy('created_at', 'desc')->paginate($perPage);
    }

    /**
     * Get supplier by ID
     */
    public function getById(int $id): ?Supplier
    {
        return Supplier::find($id);
    }

    /**
     * Get supplier by UUID
     */
    public function getByUuid(string $uuid): ?Supplier
    {
        return Supplier::where('uuid', $uuid)->first();
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
            throw new Exception("Failed to create supplier");
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
            throw new Exception("Failed to update supplier ");
        }
    }

    /**
     * Update supplier by UUID from DTO
     */
    public function updateByUuid(string $uuid, SupplierDto $dto): ?Supplier
    {
        try {
            $supplier = $this->getByUuid($uuid);

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
            throw new Exception("Failed to update supplier");
        }
    }

    /**
     * Delete supplier by ID
     */
    public function delete(string $id): bool
    {
        try {
            $supplier = $this->getByUuid($id);

            if (!$supplier) {
                return false;
            }

            return $supplier->delete();
        } catch (Exception $e) {
            throw new Exception("Failed to delete supplier");
        }
    }

    /**
     * Search suppliers by name
     */
    public function searchByName(string $name, int $perPage = 15): LengthAwarePaginator
    {
        return Supplier::where('name', 'LIKE', "%{$name}%")
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }
}
