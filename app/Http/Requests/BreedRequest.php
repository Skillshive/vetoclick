<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

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
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'species_id' => 'required|exists:species,id',
            'size' => 'nullable|string|max:50',
            'average_lifespan' => 'nullable|string|max:50',
            'temperament' => 'nullable|string|max:255',
            'exercise_needs' => 'nullable|string|max:255',
            'grooming_needs' => 'nullable|string|max:255',
            'origin' => 'nullable|string|max:100',
            'image_url' => 'nullable|url|max:255',
        ];
    }
}
