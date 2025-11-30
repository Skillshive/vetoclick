<?php

namespace App\Http\Requests\Stock;

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
            'reference' => 'nullable|string|max:255|unique:orders,reference,' . $this->route('order'),
            'supplier_id' => 'required|string|exists:suppliers,uuid',
            'order_type' => 'nullable|string|in:' . implode(',', array_column(OrderType::cases(), 'value')),
            'status' => 'nullable|string|in:' . implode(',', array_column(OrderStatus::cases(), 'value')),
            'products' => 'nullable|array',
            'products.*.product_id' => 'required|string|exists:products,uuid',
            'products.*.quantity' => 'required|integer|min:1',
            'products.*.price' => 'required|numeric|min:0',
            'products.*.total' => 'required|numeric|min:0',
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
    public function messages(): array
    {
        return [
            'name.required' => __('validation.category_name_required'),
            'name.unique' => __('validation.category_name_unique'),
            'name.max' => __('validation.category_name_max'),
            'description.max' => __('validation.description_max'),
            'category_product_id.exists' => __('validation.parent_category_not_exists'),
        ];
    }
}
