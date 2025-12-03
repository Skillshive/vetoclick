<?php

namespace App\Services;

use App\DTOs\Stock\OrderDto;
use App\Enums\OrderStatus;
use App\Models\Blog;
use App\Interfaces\ServiceInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use App\Models\Order;
use App\Models\OrderProduct;
use App\Models\Product;
use App\Models\Supplier;
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
     * Get filtered orders with search, status, and supplier filters
     */
    public function getFiltered(array $filters): LengthAwarePaginator
    {
        $query = Order::with(['supplier', 'requestedBy', 'receivedBy', 'cancelledBy', 'products']);

        // Apply search filter
        if (!empty($filters['search'])) {
            $query->where('reference', 'like', '%' . $filters['search'] . '%');
        }

        // Apply status filter
        if (!empty($filters['status'])) {
            $statusNames = explode(',', $filters['status']);
            $statusValues = [];
            
            foreach ($statusNames as $statusName) {
                $statusName = trim($statusName);
                foreach (OrderStatus::cases() as $case) {
                    if ($case->text() === $statusName) {
                        $statusValues[] = $case->value;
                        break;
                    }
                }
            }
            
            if (!empty($statusValues)) {
                $query->whereIn('status', $statusValues);
            }
        }

        // Apply supplier filter
        if (!empty($filters['supplier'])) {
            $suppliers = explode(',', $filters['supplier']);
            $query->whereHas('supplier', function ($q) use ($suppliers) {
                $q->whereIn('name', $suppliers);
            });
        }

        return $query->orderBy('created_at', 'desc')
            ->paginate($filters['per_page'] ?? 10);
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
            // Get supplier ID from UUID
            $supplier = Supplier::where('uuid', $dto->supplier_id)->first();
            if (!$supplier) {
                throw new Exception("Supplier not found");
            }

            $order = Order::create(
                [
                    'reference' => $dto->reference ?? $this->generateReference(),
                    'supplier_id' => $supplier->id,
                    'order_type' => $dto->order_type,
                    'status' => OrderStatus::PENDING->value,
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
                    'requested_by' => auth()->id()
                ] 
            );

            foreach ($dto->products as $product) {
                // Get product by ID
                $productModel = Product::find($product['product_id']);
                
                if ($productModel) {
                    OrderProduct::create([
                        'order_id' => $order->id,
                        'product_id' => $productModel->id,
                        'quantity' => $product['quantity'],
                        'unit_price' => $product['unit_price'],
                        'tva' => $product['tva'] ?? 0,
                        'reduction_taux' => $product['reduction_taux'] ?? 0,
                        'total_price' => $product['total_price'],
                    ]);
                }
            }
            return $order->load(['supplier', 'requestedBy', 'receivedBy', 'cancelledBy', 'products']);
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

           
            // Get supplier ID from UUID
            $supplier = Supplier::where('uuid', $dto->supplier_id)->first();
            if (!$supplier) {
                throw new Exception("Supplier not found");
            }

            $order->update(
                [
                    'reference' => $dto->reference,
                    'supplier_id' => $supplier->id,
                    'order_type' => $dto->order_type,
                    'status' => $dto->status ?? 1,
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
                // Get product by ID
                $productModel = Product::find($product['product_id']);
                
                if ($productModel) {
                    OrderProduct::create([
                        'order_id' => $order->id,
                        'product_id' => $productModel->id,
                        'quantity' => $product['quantity'],
                        'unit_price' => $product['unit_price'],
                        'tva' => $product['tva'] ?? 0,
                        'reduction_taux' => $product['reduction_taux'] ?? 0,
                        'total_price' => $product['total_price'],
                    ]);
                }
            }
            return $order->refresh()->load(['supplier', 'requestedBy', 'receivedBy', 'cancelledBy', 'products']);
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

    /**
     * Get order statistics
     */
    public function getStatistics(): array
    {
        $totalOrders = Order::count();
        $draftOrders = Order::where('status', 1)->count(); // Draft
        $confirmedOrders = Order::where('status', 3)->count(); // Confirmed
        $receivedOrders = Order::where('status', 7)->count(); // Received
        $cancelledOrders = Order::where('status', 9)->count(); // Cancelled
        $totalAmount = Order::sum('total_amount');

        return [
            'totalOrders' => $totalOrders,
            'draftOrders' => $draftOrders,
            'confirmedOrders' => $confirmedOrders,
            'receivedOrders' => $receivedOrders,
            'cancelledOrders' => $cancelledOrders,
            'totalAmount' => number_format($totalAmount, 2, '.', ''),
        ];
    }

    private function generateReference()
    {
        return 'ORD-' . date('Y') . '-' . str_pad(Order::count() + 1, 4, '0', STR_PAD_LEFT);
    }
}