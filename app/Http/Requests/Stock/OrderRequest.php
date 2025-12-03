<?php

namespace App\Http\Requests\Stock;

use App\Enums\OrderStatus;
use App\Enums\OrderType;
use App\Enums\PaymentMethod;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class OrderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'reference' =>  [
                'nullable',
                'string',
                'max:255',
                Rule::unique('orders', 'reference')->ignore($this->uuid, 'uuid')
            ],
            'supplier_id' => 'required|string|exists:suppliers,uuid',
            'order_type' => 'nullable|string|in:' . implode(',', array_column(OrderType::cases(), 'value')),
            'status' => 'nullable|string|in:' . implode(',', array_column(OrderStatus::cases(), 'value')),
            'products' => 'nullable|array',
            'products.*.product_id' => 'required|string|exists:products,uuid',
            'products.*.quantity' => 'required|integer|min:1',
            'products.*.unit_price' => 'required|numeric|min:0',
            'products.*.tva' => 'nullable|numeric|min:0|max:100',
            'products.*.reduction_taux' => 'nullable|numeric|min:0|max:100',
            'products.*.total_price' => 'required|numeric|min:0',
            'products.*.product_name' => 'nullable|string',
            'subtotal' => 'required|numeric|min:0',
            'tax_amount' => 'required|numeric|min:0',
            'shipping_cost' => 'required|numeric|min:0',
            'discount_amount' => 'required|numeric|min:0',
            'total_amount' => 'required|numeric|min:0',
            'discount_percentage' => 'required|numeric|min:0|max:100',
            'payment_due_date' => 'nullable|date',
            'payment_method' => 'nullable|string|in:' . implode(',', array_column(PaymentMethod::cases(), 'value')),
            'order_date' => 'nullable|date',
            'confirmed_delivery_date' => 'nullable|date',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    protected function failedValidation(\Illuminate\Contracts\Validation\Validator $validator)
    {
        \Log::error('Order validation failed', [
            'errors' => $validator->errors()->toArray(),
            'data' => $this->all()
        ]);
        
        parent::failedValidation($validator);
    }

    public function messages(): array
    {
        return [
            'supplier_id.required' => __('validation.supplier_required'),
            'supplier_id.exists' => __('validation.supplier_not_found'),
            'order_type.required' => __('validation.order_type_required'),
            'order_date.required' => __('validation.order_date_required'),
            'products.required' => __('validation.products_required'),
            'products.*.product_id.required' => __('validation.product_required'),
            'products.*.product_id.exists' => __('validation.product_not_found'),
            'products.*.quantity.required' => __('validation.quantity_required'),
            'products.*.quantity.min' => __('validation.quantity_min'),
            'products.*.unit_price.required' => __('validation.unit_price_required'),
            'products.*.unit_price.min' => __('validation.unit_price_min'),
            'products.*.total_price.required' => __('validation.total_price_required'),
        ];
    }
}
