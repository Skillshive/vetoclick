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
            'image' => 'nullable|image|mimes:jpg,jpeg,png,gif,webp|max:2048',
        ];
    }

    /**
     * Get custom error messages for validation rules.
     */
    public function messages(): array
    {
        return [
            'name.required' => __('validation.custom.name.required'),
            'name.string' => __('validation.custom.name.string'),
            'name.max' => __('validation.custom.name.max'),
            'name.unique' => __('validation.custom.name.unique'),
            'description.string' => __('validation.custom.description.string'),
            'description.max' => __('validation.custom.description.max'),
            'image.image' => __('validation.custom.image.image'),
            'image.mimes' => __('validation.custom.image.mimes'),
            'image.max' => __('validation.custom.image.max'),
        ];
    }
}