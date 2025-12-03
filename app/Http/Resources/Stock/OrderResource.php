<?php

namespace App\Http\Resources\Stock;

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
        return [
            'uuid' => $this->uuid,
            'reference' => $this->reference,
            'supplier' => [
                'uuid' => $this?->supplier?->uuid,
                'name' => $this?->supplier?->name,
            ],
            'order_type' =>OrderType::from($this->order_type)->text(),
            'status' => OrderStatus::from($this->status)->text(),
            'subtotal' => number_format($this->subtotal, 2),
            'tax_amount' => number_format($this->tax_amount, 2),
            'shipping_cost' => number_format($this->shipping_cost, 2),
            'discount_amount' => number_format($this->discount_amount, 2),
            'total_amount' => number_format($this->total_amount, 2),
            'discount_percentage' => $this->discount_percentage,
            'payment_due_date' => $this->payment_due_date,
            'payment_method' => PaymentMethod::from($this->payment_method)->text(),
            'order_date' => $this->order_date,
            'confirmed_delivery_date' => $this->confirmed_delivery_date,
            'requested_by' => $this->requested_by,
            'approved' => $this->approved,
            'approved_at' => $this->approved_at,
            'received_at' => $this->received_at,
            'received_by' => [
                'uuid' => $this?->receivedBy?->uuid,
                'name' => $this?->receivedBy?->firstname . ' ' . $this?->receivedBy?->lastname,
            ],
            'receiving_notes' => $this->receiving_notes,
            'cancellation_reason' => $this->cancellation_reason,
            'cancelled_by' => [
                'uuid' => $this?->cancelledBy?->uuid,
                'name' => $this?->cancelledBy?->firstname . ' ' . $this?->cancelledBy?->lastname,
            ],
            'cancelled_at' => $this->cancelled_at,
            'return_reason' => $this->return_reason,
            'returned_at' => $this->returned_at,
        ];
    }
}