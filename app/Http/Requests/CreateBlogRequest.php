<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateBlogRequest extends FormRequest
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
            'title' => 'required|string|max:255',
            'body' => 'required|string',
            'caption' => 'required|string|max:255',
            'image_id' => 'nullable|integer|exists:images,id',
            'meta_title' => 'required|string|max:255',
            'meta_desc' => 'required|string',
            'meta_keywords' => 'required|string|max:255',
            'category_blog_id' => 'required|integer|exists:category_blogs,id',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:255'
        ];
    }

    /**
     * Get custom error messages for validation rules.
     */
    public function messages(): array
    {
        return [
            'title.required' => 'Blog title is required.',
            'body.required' => 'Blog body is required.',
            'caption.required' => 'Blog caption is required.',
            'meta_title.required' => 'Meta title is required.',
            'meta_desc.required' => 'Meta description is required.',
            'meta_keywords.required' => 'Meta keywords are required.',
            'category_blog_id.required' => 'Category is required.',
            'category_blog_id.exists' => 'Selected category does not exist.',
            'image_id.exists' => 'Selected image does not exist.',
        ];
    }
}