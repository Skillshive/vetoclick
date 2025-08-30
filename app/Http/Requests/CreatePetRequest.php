<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreatePetRequest extends FormRequest
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
            'client_id' => 'required|exists:clients,id',
            'species_id' => 'required|exists:species,id',
            'breed_id' => 'nullable|exists:breeds,id',
            'name' => 'required|string|max:100',
            'gender' => 'nullable|in:male,female,other',
            'date_of_birth' => 'nullable|date',
            'color' => 'nullable|string|max:50',
            'weight' => 'nullable|numeric|min:0',
            'microchip_number' => 'nullable|string|max:50|unique:pets,microchip_number',
            'medical_history' => 'nullable|string',
            'dietary_restrictions' => 'nullable|string',
            'behavioral_notes' => 'nullable|string',
            'image_url' => 'nullable|url|max:255',
            'deworming_date' => 'nullable|date',
            'rabies_vaccination_date' => 'nullable|date',
            'sterilization_date' => 'nullable|date',
            'last_vet_visit' => 'nullable|date',
            'next_vaccination_date' => 'nullable|date|after_or_equal:today',
            'insurance_details' => 'nullable|string|max:500',
        ];
    }

    /**
     * Get custom error messages for validation rules.
     */
    public function messages(): array
    {
        return [
            'client_id.required' => 'Client ID is required.',
            'client_id.exists' => 'The selected client does not exist.',
            'species_id.required' => 'Species is required.',
            'species_id.exists' => 'The selected species does not exist.',
            'breed_id.exists' => 'The selected breed does not exist.',
            'name.required' => 'Pet name is required.',
            'name.string' => 'Pet name must be a string.',
            'name.max' => 'Pet name cannot exceed 100 characters.',
            'gender.in' => 'Gender must be one of: male, female, other.',
            'date_of_birth.date' => 'Date of birth must be a valid date.',
            'color.string' => 'Color must be a string.',
            'color.max' => 'Color cannot exceed 50 characters.',
            'weight.numeric' => 'Weight must be a number.',
            'weight.min' => 'Weight must be a positive number.',
            'microchip_number.string' => 'Microchip number must be a string.',
            'microchip_number.max' => 'Microchip number cannot exceed 50 characters.',
            'microchip_number.unique' => 'This microchip number is already registered.',
            'image_url.url' => 'The image URL must be a valid URL.',
            'image_url.max' => 'The image URL cannot exceed 255 characters.',
            'next_vaccination_date.after_or_equal' => 'Next vaccination date must be today or in the future.',
            'insurance_details.max' => 'Insurance details cannot exceed 500 characters.',
        ];
    }
}
