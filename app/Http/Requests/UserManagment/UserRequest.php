<?php

namespace App\Http\Requests\UserManagment;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Role;

class UserRequest extends FormRequest
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
            'firstname' => [
                'required',
                'string',
                'max:20'
            ],
            'lastname' => [
                'required',
                'string',
                'max:20',
                Rule::unique('users', 'lastname')
                    ->ignore($this->route('user'), 'uuid'),
            ],
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:50',
                Rule::unique('users', 'email')
                    ->ignore($this->route('user'), 'uuid'),
            ],
            'phone' => [
                'required',
                'string',
                'max:20',
                Rule::unique('users', 'phone')
                    ->ignore($this->route('user'), 'uuid'),
                'regex:/^(\+212|0)[0-9]{9}$/'
            ],
            'image' => 'nullable|image|mimes:jpg,jpeg,png,gif,webp|max:2048',
            'role' => 'nullable|exists:roles,uuid',
        ];

        // If role is receptionist, require veterinarian_id
        if ($this->input('role')) {
            $role = Role::where('uuid', $this->input('role'))->first();
            if ($role && $role->name === 'receptionist') {
                $rules['veterinarian_id'] = 'required|exists:veterinarians,uuid';
            }
        }

        return $rules;
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
                 'first_name.required' => __('validation.first_name_required'),
        'first_name.string'   => __('validation.first_name_string'),
        'first_name.max'      => __('validation.first_name_max'),
        'first_name.unique'   => __('validation.first_name_unique'),

        'last_name.required' => __('validation.last_name_required'),
        'last_name.string'   => __('validation.last_name_string'),
        'last_name.max'      => __('validation.last_name_max'),
        'last_name.unique'   => __('validation.last_name_unique'),

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

        'password.required'  => __('validation.password_required'),
        'password.string'    => __('validation.password_string'),
        'password.min'       => __('validation.password_min'),
        'password.confirmed' => __('validation.password_confirmed'),

        'role.exists' => __('validation.role_exists'),
        ];
    }
}
