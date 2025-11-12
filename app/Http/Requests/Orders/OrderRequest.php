<?php

namespace App\Http\Requests\Orders;

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
        $orderUuid = $this->route('order');
        $enumValues = static fn ($cases) => array_map(static fn ($case) => $case->value, $cases);

        return [
            'reference' => [
                'nullable',
                'string',
                'max:50',
                Rule::unique('orders', 'reference')->ignore($orderUuid, 'uuid'),
            ],
            'supplier_id' => [
                'required',
                'integer',
                'exists:suppliers,id',
            ],
            'order_type' => [
                'required',
                'integer',
                Rule::in($enumValues(OrderType::cases())),
            ],
            'status' => [
                'required',
                'integer',
                Rule::in($enumValues(OrderStatus::cases())),
            ],
            'subtotal' => ['required', 'numeric', 'min:0'],
            'tax_amount' => ['required', 'numeric', 'min:0'],
            'shipping_cost' => ['required', 'numeric', 'min:0'],
            'discount_amount' => ['required', 'numeric', 'min:0'],
            'total_amount' => ['required', 'numeric', 'min:0'],
            'discount_percentage' => ['nullable', 'numeric', 'between:0,100'],
            'payment_due_date' => ['nullable', 'date'],
            'payment_method' => [
                'required',
                'integer',
                Rule::in($enumValues(PaymentMethod::cases())),
            ],
            'order_date' => ['required', 'date'],
            'confirmed_delivery_date' => ['nullable', 'date', 'after_or_equal:order_date'],
            'approved' => ['sometimes', 'boolean'],
            'approved_at' => ['nullable', 'date'],
            'received_at' => ['nullable', 'date'],
            'received_by' => ['nullable', 'integer', 'exists:users,id'],
            'receiving_notes' => ['nullable', 'string'],
            'cancellation_reason' => ['nullable', 'string'],
            'cancelled_by' => ['nullable', 'integer', 'exists:users,id'],
            'cancelled_at' => ['nullable', 'date'],
            'return_reason' => ['nullable', 'string'],
            'returned_at' => ['nullable', 'date'],
        ];
    }

    public function messages(): array
    {
        return [
            'supplier_id.required' => __('validation.required', ['attribute' => 'supplier']),
            'reference.unique' => __('validation.unique', ['attribute' => 'reference']),
        ];
    }
}

