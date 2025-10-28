<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SupplierRequest extends FormRequest
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
             'name' => [
                'required',
                'string',
                'max:20',
                Rule::unique('suppliers', 'name')
                    ->ignore($this->route('supplier'), 'uuid'),
            ],
             'email' => [
                'required',
                'string',
                'max:20',
                Rule::unique('suppliers', 'email')
                    ->ignore($this->route('supplier'), 'uuid'),
            ],
             'phone' => [
                'required',
                'string',
                'max:20',
                Rule::unique('suppliers', 'phone')
                    ->ignore($this->route('supplier'), 'uuid'),
            ],
            'address' => 'nullable|string|max:255'
        ];
    }

    /**
     * Get custom error messages for validation rules.
     */
    public function messages(): array
    {
        return [
        'name.required' => __('validation.name_required'),
        'name.string'   => __('validation.name_string'),
        'name.max'      => __('validation.name_max'),
        'name.unique'   => __('validation.name_unique'),

        'email.required' => __('validation.email_required'),
        'email.string'   => __('validation.email_string'),
        'email.lowercase' => __('validation.email_lowercase'),
        'email.email'    => __('validation.email_invalid'),
        'email.max'      => __('validation.email_max'),
        'email.unique'   => __('validation.email_unique'),

        'phone.required' => __('validation.phone_required'),
        'phone.string'   => __('validation.phone_string'),
        'phone.max'      => __('validation.phone_max'),
        'phone.unique'   => __('validation.phone_unique'),
        'phone.regex'    => __('validation.phone_regex'),
        ];
    }
}
