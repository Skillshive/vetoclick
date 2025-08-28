<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $productId = $this->route('product');

        return [
            'name' => 'sometimes|required|string|max:255',
            'sku' => ['sometimes', 'required', 'string', 'max:255', Rule::unique('products', 'sku')->ignore($productId)],
            'category_product_id' => 'sometimes|required|exists:category_products,id',
            'brand' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'barcode' => ['nullable', 'string', 'max:255', Rule::unique('products', 'barcode')->ignore($productId)],
            'type' => 'nullable|integer',
            'dosage_form' => 'nullable|string|max:255',
            'target_species' => 'nullable|array',
            'administration_route' => 'nullable|string|max:255',
            'prescription_required' => 'nullable|boolean',
            'minimum_stock_level' => 'nullable|integer',
            'maximum_stock_level' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
            'availability_status' => 'nullable|integer',
            'notes' => 'nullable|string',
            'images' => 'nullable|array',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Product name is required.',
            'name.unique' => 'A product with this name already exists.',
            'sku.required' => 'SKU is required.',
            'sku.unique' => 'A product with this SKU already exists.',
            'category_product_id.required' => 'Product category is required.',
            'category_product_id.exists' => 'The selected category does not exist.',
        ];
    }
}
