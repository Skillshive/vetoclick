<?php

namespace App\Http\Requests;

use App\Models\Breed;
use App\Models\Client;
use App\Models\Species;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
        $pet = $this->route('pet');

        return [
            'client_id' => 'nullable|exists:clients,id', // UUID of client (for receptionist creating pets)
            'name' => 'required|string|max:100',
            'breed_id' => 'required|exists:breeds,id',
            'sex' => 'required|integer|in:0,1',
            'neutered_status' => 'nullable|boolean',
            'dob' => 'nullable|date',
            'microchip_ref' => [
                'nullable',
                'string',
                'max:50',
                $pet ? Rule::unique('pets', 'microchip_ref')->ignore($pet->getKey()) : 'unique:pets,microchip_ref',
            ],
            'profile_img' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'weight_kg' => 'nullable|numeric|min:0|max:999.99',
            'bcs' => 'nullable|integer|min:1|max:9',
            'color' => 'nullable|string|max:50',
            'notes' => 'nullable|string',
            'deceased_at' => 'nullable|date',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Convert client_id from UUID to ID if provided
        if ($this->has('client_id') && $this->input('client_id')) {
            $clientId = $this->input('client_id');
            if (!is_numeric($clientId)) {
                $client = Client::where('uuid', $clientId)->first();
                if ($client) {
                    $this->merge(['client_id' => $client->id]);
                } else {
                    $this->merge(['client_id' => null]);
                }
            }
        }

        // Convert specie_id from UUID to ID if needed
        if ($this->has('species_id')) {
            $speciesId = $this->input('species_id');
            if (!is_numeric($speciesId)) {
                $species = Species::where('uuid', $speciesId)->first();
                if ($species) {
                    $this->merge(['species_id' => $species->id]);
                } else {
                    $this->merge(['species_id' => null]);
                }
            }
        }

        // Convert breed_id from UUID to ID if needed
        if ($this->has('breed_id') && $this->input('breed_id')) {
            $breedId = $this->input('breed_id');
            if (!is_numeric($breedId)) {
                $breed = Breed::where('uuid', $breedId)->first();
                if ($breed) {
                    $this->merge(['breed_id' => $breed->id]);
                } else {
                    $this->merge(['breed_id' => null]);
                }
            }
        }

        // Convert sex to integer
        if ($this->has('sex')) {
            $sex = $this->input('sex');
            if (is_string($sex)) {
                $this->merge(['sex' => $sex === '1' || $sex === 'male' ? 1 : 0]);
            }
        }

        // Convert neutered_status to boolean
        if ($this->has('neutered_status')) {
            $neutered = $this->input('neutered_status');
            if (is_string($neutered)) {
                $this->merge(['neutered_status' => $neutered === '1' || $neutered === 'true']);
            }
        }

        // Convert weight_kg to float
        if ($this->has('weight_kg') && $this->input('weight_kg') !== null && $this->input('weight_kg') !== '') {
            $this->merge(['weight_kg' => (float) $this->input('weight_kg')]);
        } else {
            $this->merge(['weight_kg' => null]);
        }

        // Convert bcs to integer
        if ($this->has('bcs') && $this->input('bcs') !== null && $this->input('bcs') !== '') {
            $this->merge(['bcs' => (int) $this->input('bcs')]);
        } else {
            $this->merge(['bcs' => null]);
        }
    }
}
