<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RoleRequest extends FormRequest
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
        $roleUuid = $this->route('role');
        $roleId = null;
        
        // If we have a UUID, find the corresponding ID
        if ($roleUuid) {
            $role = \App\Models\Role::where('uuid', $roleUuid)->first();
            $roleId = $role ? $role->id : null;
        }
        
        return [
            'name' => ['required', 'string', 'max:255', 'unique:roles,name,' . $roleId],
            'description' => ['nullable', 'string', 'max:500'],
            'permissions' => ['array'],
            'permissions.*' => ['exists:permissions,uuid'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array
     */
    public function messages(): array
    {
        return [
            'name.required' => __('validation.role_name_required'),
            'name.unique' => __('validation.role_name_unique'),
            'name.max' => __('validation.role_name_max'),
            'description.max' => __('validation.role_description_max'),
            'permissions.array' => __('validation.permissions_array'),
            'permissions.*.exists' => __('validation.permissions_exists'),
        ];
    }
}
