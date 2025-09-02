<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCategoryProductRequest extends FormRequest
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
        $categoryProductId = $this->route('category_product');
        
        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('category_products', 'name')->ignore($categoryProductId, 'uuid')
            ],
            'description' => 'nullable|string|max:1000',
            'category_product_id' => 'nullable|integer|exists:category_products,id',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Le nom de la catégorie est obligatoire.',
            'name.unique' => 'Cette catégorie existe déjà.',
            'name.max' => 'Le nom ne peut pas dépasser 255 caractères.',
            'description.max' => 'La description ne peut pas dépasser 1000 caractères.',
            'category_product_id.exists' => 'La catégorie parent sélectionnée n\'existe pas.',
        ];
    }
}
