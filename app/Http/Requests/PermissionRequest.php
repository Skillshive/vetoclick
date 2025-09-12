<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PermissionRequest extends FormRequest
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
        $permissionId = $this->route('permission') ? $this->route('permission') : null;
        
        return [
            'name' => ['required', 'string', 'max:255', 'unique:permissions,name,' . $permissionId],
            'guard_name' => ['required', 'string', 'max:255'],
            'grp_id' => ['required', 'exists:permission_groups,id'],
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
            'name.required' => 'The permission name is required.',
            'name.unique' => 'The permission name has already been taken.',
            'guard_name.required' => 'The guard name is required.',
            'grp_id.required' => 'The permission group is required.',
            'grp_id.exists' => 'The selected permission group does not exist.',
        ];
    }
}
