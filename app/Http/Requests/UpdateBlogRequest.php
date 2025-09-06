<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBlogRequest extends FormRequest
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
            'title' => 'sometimes|string|max:255',
            'body' => [
                'required',
                'string',
                function ($attribute, $value, $fail) {
                    // Reject unsafe tags like <script>, <iframe>, <object>, <embed>, <style>
                    if (preg_match('/<(script|iframe|object|embed|style)\b/i', $value)) {
                        $fail("The {$attribute} contains unsafe HTML.");
                    }
                }
            ],            'caption' => 'sometimes|string|max:255',
            'image_id' => 'nullable|integer|exists:images,id',
            'meta_title' => 'sometimes|string|max:255',
            'meta_desc' => 'sometimes|string',
            'meta_keywords' => 'sometimes|string|max:255',
            'category_blog_id' => 'sometimes|integer|exists:category_blogs,id',
            'tags' => 'nullable|string|max:255'
        ];
    }

    /**
     * Get custom error messages for validation rules.
     */
    public function messages(): array
    {
        return [
            'title.string' => 'Blog title must be a string.',
            'title.max' => 'Blog title cannot exceed 255 characters.',
            'body.string' => 'Blog body must be a string.',
            'caption.string' => 'Blog caption must be a string.',
            'caption.max' => 'Blog caption cannot exceed 255 characters.',
            'meta_title.string' => 'Meta title must be a string.',
            'meta_title.max' => 'Meta title cannot exceed 255 characters.',
            'meta_desc.string' => 'Meta description must be a string.',
            'meta_keywords.string' => 'Meta keywords must be a string.',
            'meta_keywords.max' => 'Meta keywords cannot exceed 255 characters.',
            'category_blog_id.integer' => 'Category must be an integer.',
            'category_blog_id.exists' => 'Selected category does not exist.',
            'image_id.integer' => 'Image ID must be an integer.',
            'image_id.exists' => 'Selected image does not exist.',
            'tags.string' => 'Tags must be a string.',
            'tags.max' => 'Tags cannot exceed 255 characters.',
        ];
    }
}