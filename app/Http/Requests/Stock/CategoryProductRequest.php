<?php

namespace App\Http\Requests\Stock;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CategoryProductRequest extends FormRequest
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
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('category_products', 'name')
                    ->ignore($this->route('category_product')), 
            ],
            'description' => 'nullable|string|max:1000',
            'category_product_id' => 'nullable|uuid|exists:category_products,uuid',
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
