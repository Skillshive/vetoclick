<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;

class CreateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'sku' => 'required|string|max:255|unique:products,sku',
            'category_product_id' => 'required|exists:category_products,id',
            'brand' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'barcode' => 'nullable|string|max:255|unique:products,barcode',
            'type' => 'nullable|integer',
            'dosage_form' => 'nullable|string|max:255',
            'target_species' => 'nullable|array',
            'administration_route' => 'nullable|string|max:255',
            'prescription_required' => 'nullable|boolean',
            'minimum_stock_level' => 'nullable|integer|min:0',
            'maximum_stock_level' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
            'availability_status' => 'nullable|integer',
            'notes' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => __('common.product_name_required'),
            'name.max' => __('common.product_name_max'),
            'sku.required' => __('common.sku_required'),
            'sku.unique' => __('common.sku_unique'),
            'sku.max' => __('common.sku_max'),
            'category_product_id.required' => __('common.category_required'),
            'category_product_id.exists' => __('common.category_not_found'),
            'barcode.unique' => __('common.barcode_unique'),
            'barcode.max' => __('common.barcode_max'),
            'minimum_stock_level.min' => __('common.minimum_stock_min'),
            'maximum_stock_level.min' => __('common.maximum_stock_min'),
        ];
    }
}
