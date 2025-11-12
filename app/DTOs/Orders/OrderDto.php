<?php

namespace App\DTOs\Orders;

use App\common\DTO;
use Illuminate\Http\Request;

class OrderDto extends DTO
{
    public function __construct(
        public string $reference = '',
        public int $supplier_id = 0,
        public int $order_type = 0,
        public int $status = 0,
        public float $subtotal = 0,
        public float $tax_amount = 0,
        public float $shipping_cost = 0,
        public float $discount_amount = 0,
        public float $total_amount = 0,
        public ?float $discount_percentage = null,
        public ?string $payment_due_date = null,
        public int $payment_method = 0,
        public string $order_date = '',
        public ?string $confirmed_delivery_date = null,
        public ?int $requested_by = null,
        public bool $approved = false,
        public ?string $approved_at = null,
        public ?string $received_at = null,
        public ?int $received_by = null,
        public ?string $receiving_notes = null,
        public ?string $cancellation_reason = null,
        public ?int $cancelled_by = null,
        public ?string $cancelled_at = null,
        public ?string $return_reason = null,
        public ?string $returned_at = null,
    ) {
    }

    public static function fromRequest(Request $request, ?int $requestedBy = null): self
    {
        $nullable = static fn ($value) => $value === '' ? null : $value;

        return new self(
            reference: (string) $request->input('reference', ''),
            supplier_id: (int) $request->input('supplier_id', 0),
            order_type: (int) $request->input('order_type', 0),
            status: (int) $request->input('status', 0),
            subtotal: (float) $request->input('subtotal', 0),
            tax_amount: (float) $request->input('tax_amount', 0),
            shipping_cost: (float) $request->input('shipping_cost', 0),
            discount_amount: (float) $request->input('discount_amount', 0),
            total_amount: (float) $request->input('total_amount', 0),
            discount_percentage: $nullable($request->input('discount_percentage')),
            payment_due_date: $nullable($request->input('payment_due_date')),
            payment_method: (int) $request->input('payment_method', 0),
            order_date: (string) $request->input('order_date', ''),
            confirmed_delivery_date: $nullable($request->input('confirmed_delivery_date')),
            requested_by: $requestedBy ?? $request->input('requested_by'),
            approved: (bool) $request->boolean('approved', false),
            approved_at: $nullable($request->input('approved_at')),
            received_at: $nullable($request->input('received_at')),
            received_by: $nullable($request->input('received_by')),
            receiving_notes: $nullable($request->input('receiving_notes')),
            cancellation_reason: $nullable($request->input('cancellation_reason')),
            cancelled_by: $nullable($request->input('cancelled_by')),
            cancelled_at: $nullable($request->input('cancelled_at')),
            return_reason: $nullable($request->input('return_reason')),
            returned_at: $nullable($request->input('returned_at')),
        );
    }
}

