<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Validation\ValidationException;

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

    /**
     * Handle a failed validation attempt.
     */
    protected function failedValidation(Validator $validator)
    {
        response()->json([
            'message' => 'Validation failed',
            'errors' => $validator->errors()
        ], 422)->header('X-Inertia', false)->send();
        exit;
    }

}