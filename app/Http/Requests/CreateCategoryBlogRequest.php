<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateCategoryBlogRequest extends FormRequest
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
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255|unique:category_blogs,name',
            'desp' => 'nullable|string',
            'parent_category_id' => 'nullable|exists:category_blogs,uuid',
        ];
    }

    /**
     * Get custom error messages for validation rules.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Category blog name is required.',
            'name.unique' => 'A category blog with this name already exists.',
            'parent_category_id.exists' => 'The selected parent category does not exist.',
        ];
    }
}