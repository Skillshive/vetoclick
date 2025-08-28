<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateSpeciesRequest extends FormRequest
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
            'name' => 'required|string|max:255|unique:species,name',
            'description' => 'nullable|string|max:1000',
        ];
    }

    /**
     * Get custom error messages for validation rules.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Species name is required.',
            'name.string' => 'Species name must be a string.',
            'name.max' => 'Species name cannot exceed 255 characters.',
            'name.unique' => 'A species with this name already exists.',
            'description.string' => 'Description must be a string.',
            'description.max' => 'Description cannot exceed 1000 characters.',
        ];
    }
}
