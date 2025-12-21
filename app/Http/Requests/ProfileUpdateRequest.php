<?php

namespace App\Http\Requests;

use App\Models\User;
use App\Rules\ValidAddress;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
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
        $rules = [
            'firstname' => ['required', 'string', 'max:255'],
            'lastname' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique(User::class)->ignore($this->user()->id),
            ],
            'phone' => [
                'required',
                'string',
                'max:20',
                Rule::unique('users', 'phone')->ignore($this->user()->id),
                'regex:/^(\+212|0)[0-9]{9}$/'
            ],
            'image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif', 'max:2048'],
        ];

        // Add veterinary fields if user has veterinarian role
        if ($this->user()->hasRole('veterinarian')) {
            $rules = array_merge($rules, [
                'license_number' => ['nullable', 'string', 'max:255'],
                'specialization' => ['nullable', 'string', 'max:255'],
                'years_experience' => ['nullable', 'integer', 'min:0', 'max:50'],
                'clinic_name' => ['nullable', 'string', 'max:255'],
                'address' => ['nullable', 'string', 'max:500', new ValidAddress()],
                'consultation_price' => ['nullable', 'numeric', 'min:0', 'max:999999.99'],
            ]);
        }

        return $rules;
    }
}
