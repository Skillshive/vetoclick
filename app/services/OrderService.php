<?php

namespace App\Services;

use App\DTOs\Stock\OrderDto;
use App\Models\Blog;
use App\Interfaces\ServiceInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Exception;

class OrderService implements ServiceInterface
{
 
    /**
     * Get all blogs with optional pagination
     */
    public function getAll(int $perPage = 15): LengthAwarePaginator
    {
        return Order::with(['supplier', 'requestedBy', 'receivedBy', 'cancelledBy'])->orderBy('created_at', 'desc')->paginate($perPage);
    }

    /**
     * Get order by ID
     */
    public function getById(int $id): ?Order
    {
        return Order::with(['supplier', 'requestedBy', 'receivedBy', 'cancelledBy'])->find($id);
    }

    /**
     * Get blog by UUID
        */
        public function getByUuid(string $uuid): ?Order
    {
        return Order::with(['supplier', 'requestedBy', 'receivedBy', 'cancelledBy'])
                 ->where('uuid', $uuid)
                 ->first();
    }

    /**
     * Create new order from DTO
     */
    public function create(OrderDto $dto): Order
    {
        try {
            $order = Order::create(
                [
                    'reference' => $dto->reference,
                    'supplier_id' => $dto->supplier_id,
                    'order_type' => $dto->order_type,
                    'status' => $dto->status,
                    'subtotal' => $dto->subtotal,
                    'tax_amount' => $dto->tax_amount,
                    'shipping_cost' => $dto->shipping_cost,
                    'discount_amount' => $dto->discount_amount,
                    'total_amount' => $dto->total_amount,
                    'discount_percentage' => $dto->discount_percentage,
                    'payment_due_date' => $dto->payment_due_date,
                    'payment_method' => $dto->payment_method,
                    'order_date' => $dto->order_date ?? now(),
                    'confirmed_delivery_date' => $dto->confirmed_delivery_date,
                    'requested_by' => $dto->requested_by ?? auth()->user()->uuid, 
                ] 
            );

            foreach ($dto->products as $product) {
                OrderProduct::create([
                    'order_id' => $order->id,
                    'quantity' => $product['quantity'],
                    'unit_price' => $product['unit_price'],
                    'tva' => $product['tva'],
                    'reduction_taux' => $product['reduction_taux'],
                    'total_price' => $product['total_price'],
                ]);
            }

            return $order->load(['supplier', 'requestedBy', 'receivedBy', 'cancelledBy']);
        } catch (Exception $e) {
            throw new Exception("Failed to create order: " . $e->getMessage());
        }
    }

    /**
     * Update order by UUID from DTO
     */
    public function update(string $uuid, OrderDto $dto): ?Order
    {
        try {
                $order = $this->getByUuid($uuid);

            if (!$order) {
                return null;
            }


            $order->products()->delete();

           
            $order->update(
                [
                    'reference' => $dto->reference,
                    'supplier_id' => $dto->supplier_id,
                    'order_type' => $dto->order_type,
                    'status' => $dto->status,
                    'subtotal' => $dto->subtotal,
                    'tax_amount' => $dto->tax_amount,
                    'shipping_cost' => $dto->shipping_cost,
                    'discount_amount' => $dto->discount_amount,
                    'total_amount' => $dto->total_amount,
                    'discount_percentage' => $dto->discount_percentage,
                    'payment_due_date' => $dto->payment_due_date,
                    'payment_method' => $dto->payment_method,
                    'order_date' => $dto->order_date,
                    'confirmed_delivery_date' => $dto->confirmed_delivery_date,
                    'requested_by' => $dto->requested_by,
                ]
            );

            foreach ($dto->products as $product) {
                OrderProduct::create([
                    'order_id' => $order->id,
                    'quantity' => $product['quantity'],
                    'unit_price' => $product['unit_price'],
                    'tva' => $product['tva'],
                    'reduction_taux' => $product['reduction_taux'],
                    'total_price' => $product['total_price'],
                ]);
            }
            return $order->refresh();
        } catch (Exception $e) {
            throw new Exception("Failed to update order: " . $e->getMessage());
        }
    }

    /**
     * Delete blog by UUID
     */
    public function delete(string $uuid): bool
    {
        try {
            $order = $this->getByUuid($uuid);

            if (!$order) {
                return false;
            }

            $order->products()->delete();

            return $order->delete();
        } catch (Exception $e) {
            throw new Exception("Failed to delete order: " . $e->getMessage());
        }
    }

    /**
     * Search orders by reference
     */
    public function searchByReference(string $reference, int $perPage = 15): LengthAwarePaginator
    {
        return Order::with(['supplier', 'requestedBy', 'receivedBy', 'cancelledBy'])
            ->where('reference', 'LIKE', "%{$reference}%")
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    public function getBySupplierId(int $supplierId, int $perPage = 15): LengthAwarePaginator
    {
        return Order::with(['supplier', 'requestedBy', 'receivedBy', 'cancelledBy'])
            ->where('supplier_id', $supplierId)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    /**
     * Get the latest orders.
     */
    public function getLatest(int $limit = 10): Collection
    {
        return Order::with(['supplier', 'requestedBy', 'receivedBy', 'cancelledBy'])
            ->latest()
            ->take($limit)
            ->get();
    }
}