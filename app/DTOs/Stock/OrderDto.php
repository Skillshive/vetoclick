<?php

namespace App\DTOs\Stock;

use App\common\DTO;
use Illuminate\Http\Request;

class OrderDto extends DTO 
{
    public function __construct(
        public ?string $reference = '',
        public string $supplier_id = '',
        public string $order_type = '',
        public string $subtotal = '',
        public string $tax_amount = '',
        public string $shipping_cost = '',
        public string $discount_amount = '',
        public string $total_amount = '',
        public string $discount_percentage = '',
        public string $payment_due_date = '',
        public string $payment_method = '',
        public string $order_date = '',
        public string $confirmed_delivery_date = '',
        public string $requested_by = '',
        public array $products = [],
    ) {}

    public static function fromRequest(Request $request): self
    {
        return new self(
            reference: $request->input('reference', ''),
            supplier_id: $request->input('supplier_id', ''),
            order_type: $request->input('order_type', ''),
            subtotal: $request->input('subtotal', ''),
            tax_amount: $request->input('tax_amount', ''),
            shipping_cost: $request->input('shipping_cost', ''),
            discount_amount: $request->input('discount_amount', ''),
            total_amount: $request->input('total_amount', ''),
            discount_percentage: $request->input('discount_percentage', ''),
            payment_due_date: $request->input('payment_due_date', ''),
            payment_method: $request->input('payment_method', ''),
            order_date: $request->input('order_date', ''),
            confirmed_delivery_date: $request->input('confirmed_delivery_date', ''),
            products: $request->input('products', []),
        );
    }
}
