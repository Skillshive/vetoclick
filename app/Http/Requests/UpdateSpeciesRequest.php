<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSpeciesRequest extends FormRequest
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
        $speciesId = $this->route('species') ?? $this->route('id');
        
        return [
            'name' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                Rule::unique('species', 'name')->ignore($speciesId)
            ],
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
