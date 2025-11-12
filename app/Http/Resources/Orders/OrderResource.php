<?php

namespace App\Http\Resources\Orders;

use App\Enums\OrderStatus;
use App\Enums\OrderType;
use App\Enums\PaymentMethod;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $status = $this->status ? OrderStatus::tryFrom($this->status) : null;
        $orderType = $this->order_type ? OrderType::tryFrom($this->order_type) : null;
        $paymentMethod = $this->payment_method ? PaymentMethod::tryFrom($this->payment_method) : null;

        return [
            'uuid' => $this->uuid,
            'reference' => $this->reference,
            'supplier_id' => $this->supplier_id,
            'supplier' => $this->whenLoaded('supplier', fn () => [
                'uuid' => $this->supplier?->uuid,
                'name' => $this->supplier?->name,
            ]),
            'order_type' => [
                'value' => $this->order_type,
                'label' => $orderType?->text(),
            ],
            'status' => [
                'value' => $this->status,
                'label' => $status?->text(),
                'class' => $status?->class(),
            ],
            'subtotal' => (float) $this->subtotal,
            'tax_amount' => (float) $this->tax_amount,
            'shipping_cost' => (float) $this->shipping_cost,
            'discount_amount' => (float) $this->discount_amount,
            'total_amount' => (float) $this->total_amount,
            'discount_percentage' => $this->discount_percentage !== null ? (float) $this->discount_percentage : null,
            'payment_due_date' => $this->payment_due_date,
            'payment_method' => [
                'value' => $this->payment_method,
                'label' => $paymentMethod?->text(),
                'class' => $paymentMethod?->class(),
            ],
            'order_date' => $this->order_date,
            'confirmed_delivery_date' => $this->confirmed_delivery_date,
            'requested_by' => $this->requested_by,
            'approved' => (bool) $this->approved,
            'approved_at' => $this->approved_at,
            'received_at' => $this->received_at,
            'received_by' => $this->received_by,
            'receiving_notes' => $this->receiving_notes,
            'cancellation_reason' => $this->cancellation_reason,
            'cancelled_by' => $this->cancelled_by,
            'cancelled_at' => $this->cancelled_at,
            'return_reason' => $this->return_reason,
            'returned_at' => $this->returned_at,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}

