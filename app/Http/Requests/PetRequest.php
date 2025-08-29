<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PetRequest extends FormRequest
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
            'client_id' => 'required|exists:clients,id',
            'species_id' => 'required|exists:species,id',
            'breed_id' => 'nullable|exists:breeds,id',
            'name' => 'required|string|max:100',
            'gender' => 'nullable|in:male,female,other',
            'date_of_birth' => 'nullable|date',
            'color' => 'nullable|string|max:50',
            'weight' => 'nullable|numeric|min:0',
            'microchip_number' => 'nullable|string|max:50|unique:pets,microchip_number,' . $this->pet?->id,
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
}
