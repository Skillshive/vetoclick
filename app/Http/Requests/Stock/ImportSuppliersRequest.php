<?php

namespace App\Http\Requests\Stock;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ImportSuppliersRequest extends FormRequest
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
            'file' => [
                'required',
                'file',
                'mimes:csv,txt',
                'max:5120', // 5MB max
            ],
        ];
    }

    /**
     * Get validation rules for CSV row data.
     *
     * @return array
     */
    public static function getRowValidationRules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('suppliers', 'name'),
            ],
            'address' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255|unique:suppliers,email',
            'phone' => 'nullable|string|max:20',
        ];
    }

    /**
     * Get the validation messages.
     *
     * @return array
     */
    public function messages(): array
    {
        return [
            'file.required' => __('common.no_file_uploaded'),
            'file.file' => __('validation.file', ['attribute' => 'file']),
            'file.mimes' => __('validation.mimes', ['attribute' => 'file', 'values' => 'csv, txt']),
            'file.max' => __('validation.max.file', ['attribute' => 'file', 'max' => '5MB']),
        ];
    }

    /**
     * Get row validation error messages.
     *
     * @return array
     */
    public static function getRowValidationMessages(): array
    {
        return [
            'name.required' => __('validation.category_name_required'),
            'name.unique' => __('validation.category_name_unique'),
            'name.max' => __('validation.category_name_max'),
            'description.max' => __('validation.description_max'),
            'category_product_id.exists' => __('validation.parent_category_not_exists'),
        ];
    }

    /**
     * Get required CSV headers.
     *
     * @return array
     */
    public static function getRequiredHeaders(): array
    {
        return [
            'Name', 
            'Address', 
            'Email', 
            'Phone', 
        ];
    }

    /**
     * Get header mapping for CSV import.
     *
     * @return array
     */
    public static function getHeaderMapping(): array
    {
        return [
            'name' => 'Name',
            'address' => 'Address',
            'email' => 'Email',
            'phone' => 'Phone',
        ];
    }
}
