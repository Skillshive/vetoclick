<?php

namespace App\Services;

use App\DTOs\Orders\OrderDto;
use App\Enums\OrderStatus;
use App\Models\Order;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderService
{
    public function query(): Builder
    {
        return Order::query()
            ->with([
                'supplier:id,uuid,name',
            ]);
    }

    public function paginate(int $perPage = 15, array $filters = []): LengthAwarePaginator
    {
        $query = $this->applyFilters($this->query(), $filters);

        if (!empty($filters['sort_by'])) {
            $direction = $filters['sort_direction'] ?? 'desc';
            $query->orderBy($filters['sort_by'], $direction);
        } else {
            $query->orderByDesc('created_at');
        }

        return $query->paginate($perPage);
    }

    public function getAll(array $filters = []): Collection
    {
        return $this->applyFilters($this->query(), $filters)->get();
    }

    public function getByUuid(string $uuid): ?Order
    {
        return $this->query()->where('uuid', $uuid)->first();
    }

    public function create(OrderDto $dto): Order
    {
        return DB::transaction(function () use ($dto) {
            $payload = $this->mapDtoToArray($dto);

            if (empty($payload['reference'])) {
                $payload['reference'] = $this->generateReference();
            }

            if (empty($payload['status'])) {
                $payload['status'] = OrderStatus::DRAFT->value;
            }

            if (empty($payload['order_date'])) {
                $payload['order_date'] = Carbon::now()->toDateString();
            }

            return Order::create($payload);
        });
    }

    public function update(string $uuid, OrderDto $dto): ?Order
    {
        $order = $this->getByUuid($uuid);

        if (!$order) {
            return null;
        }

        return DB::transaction(function () use ($order, $dto) {
            $payload = $this->mapDtoToArray($dto, forUpdate: true);
            $order->update($payload);

            return $order->refresh();
        });
    }

    public function delete(string $uuid): bool
    {
        $order = $this->getByUuid($uuid);

        if (!$order) {
            return false;
        }

        return (bool) $order->delete();
    }

    protected function applyFilters(Builder $query, array $filters): Builder
    {
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function (Builder $builder) use ($search) {
                $builder->where('reference', 'like', "%{$search}%")
                    ->orWhereHas('supplier', static function (Builder $supplierQuery) use ($search) {
                        $supplierQuery->where('name', 'like', "%{$search}%");
                    });
            });
        }

        if (!empty($filters['status'])) {
            $query->whereIn('status', (array) $filters['status']);
        }

        if (!empty($filters['order_type'])) {
            $query->whereIn('order_type', (array) $filters['order_type']);
        }

        if (!empty($filters['supplier_ids'])) {
            $query->whereIn('supplier_id', (array) $filters['supplier_ids']);
        }

        return $query;
    }

    protected function mapDtoToArray(OrderDto $dto, bool $forUpdate = false): array
    {
        $data = [
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
            'approved' => $dto->approved,
            'approved_at' => $dto->approved_at,
            'received_at' => $dto->received_at,
            'received_by' => $dto->received_by,
            'receiving_notes' => $dto->receiving_notes,
            'cancellation_reason' => $dto->cancellation_reason,
            'cancelled_by' => $dto->cancelled_by,
            'cancelled_at' => $dto->cancelled_at,
            'return_reason' => $dto->return_reason,
            'returned_at' => $dto->returned_at,
        ];

        if ($forUpdate) {
            return array_filter(
                $data,
                static fn ($value) => $value !== null,
            );
        }

        return $data;
    }

    protected function generateReference(): string
    {
        return sprintf(
            'ORD-%s-%s',
            now()->format('Ymd'),
            Str::upper(Str::random(6))
        );
    }
}

