<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BreedRequest extends FormRequest
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
            'species_id' => 'required|exists:species,uuid',
            'breed_name' => [
                'required',
                'string',
                'max:20',
            Rule::unique('breeds', 'breed_name')->ignore($this->route('breed'), 'uuid'),
            ],
            'avg_weight_kg' => 'nullable|numeric|min:0|max:999.99',
            'life_span_years' => 'nullable|integer|min:1|max:50',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,gif,webp|max:2048',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'species_id' => 'species',
            'breed_name' => 'breed name',
            'avg_weight_kg' => 'average weight',
            'life_span_years' => 'life span',
        ];
    }
}
