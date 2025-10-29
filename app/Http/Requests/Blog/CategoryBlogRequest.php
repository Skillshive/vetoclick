<?php

namespace App\Http\Requests\Blog;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Contracts\Validation\Validator;

class CategoryBlogRequest extends FormRequest
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
              Rule::unique('category_blogs', 'name')
                  ->ignore($this->route('category_blog'), 'uuid'),
          ],
                       'desp' => 'nullable|string',
          'parent_category_id' => 'nullable|exists:category_blogs,uuid',
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
        'desp.nullable' => __('validation.desp_nullable'),
        'parent_category_id.nullable' => __('validation.parent_category_id_nullable'),
        'parent_category_id.exists' => __('validation.parent_category_id_exists')
        ];
    }

    /**
     * Handle a failed validation attempt.
     */
    protected function failedValidation(Validator $validator)
    {
        response()->json([
            'message' => 'Validation failed',
            'errors' => $validator->errors()
        ], 422)->header('X-Inertia', false)->send();
        exit;
    }

}
