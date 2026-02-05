<?php

namespace App\Http\Requests\Blog;

use Illuminate\Foundation\Http\FormRequest;

class BlogRequest extends FormRequest
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
            'title' => 'required|string|max:255',
            'body' => 'required|string',
            'caption' => 'required|string|max:255',
            'image_file' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'meta_title' => 'required|string|max:255',
            'meta_desc' => 'required|string|max:1000',
            'meta_keywords' => 'required|string|max:500',
            'category_blog_id' => 'required|string|exists:category_blogs,uuid',
            'tags' => 'required|string|max:1000',
            'is_published' => 'nullable|boolean',
            'is_featured' => 'nullable|boolean',
            'publish_date' => 'nullable|date',
            'author_id' => 'nullable|integer|exists:users,id',
        ];

        // For update requests, make fields sometimes required instead of always required
        if ($this->isMethod('PUT') || $this->isMethod('PATCH')) {
            $rules['title'] = 'sometimes|string|max:255';
            $rules['body'] = 'sometimes|string';
            $rules['caption'] = 'sometimes|string|max:255';
            $rules['meta_title'] = 'sometimes|string|max:255';
            $rules['meta_desc'] = 'sometimes|string|max:1000';
            $rules['meta_keywords'] = 'sometimes|string|max:500';
            $rules['category_blog_id'] = 'sometimes|string|exists:category_blogs,uuid';
            $rules['tags'] = 'sometimes|string|max:1000';
            $rules['is_published'] = 'sometimes|boolean';
            $rules['is_featured'] = 'sometimes|boolean';
            $rules['publish_date'] = 'sometimes|date';
            $rules['author_id'] = 'sometimes|integer|exists:users,id';
        }

        return $rules;
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'title.required' => __('validation.blog_title_required'),
            'title.string' => __('validation.blog_title_string'),
            'title.max' => __('validation.blog_title_max'),
            'body.required' => __('validation.blog_body_required'),
            'body.string' => __('validation.blog_body_string'),
            'caption.required' => __('validation.blog_caption_required'),
            'caption.string' => __('validation.blog_caption_string'),
            'caption.max' => __('validation.blog_caption_max'),
            'image_file.image' => __('validation.blog_image_file_image'),
            'image_file.mimes' => __('validation.blog_image_file_mimes'),
            'image_file.max' => __('validation.blog_image_file_max'),
            'meta_title.required' => __('validation.blog_meta_title_required'),
            'meta_title.string' => __('validation.blog_meta_title_string'),
            'meta_title.max' => __('validation.blog_meta_title_max'),
            'meta_desc.required' => __('validation.blog_meta_desc_required'),
            'meta_desc.string' => __('validation.blog_meta_desc_string'),
            'meta_desc.max' => __('validation.blog_meta_desc_max'),
            'meta_keywords.required' => __('validation.blog_meta_keywords_required'),
            'meta_keywords.string' => __('validation.blog_meta_keywords_string'),
            'meta_keywords.max' => __('validation.blog_meta_keywords_max'),
            'category_blog_id.required' => __('validation.blog_category_blog_id_required'),
            'category_blog_id.string' => __('validation.blog_category_blog_id_string'),
            'category_blog_id.exists' => __('validation.blog_category_blog_id_exists'),
            'tags.required' => __('validation.blog_tags_required'),
            'tags.string' => __('validation.blog_tags_string'),
            'tags.max' => __('validation.blog_tags_max'),
        ];
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'title' => __('validation.attributes.blog_title'),
            'body' => __('validation.attributes.blog_body'),
            'caption' => __('validation.attributes.blog_caption'),
            'image_file' => __('validation.attributes.blog_image_file'),
            'meta_title' => __('validation.attributes.blog_meta_title'),
            'meta_desc' => __('validation.attributes.blog_meta_desc'),
            'meta_keywords' => __('validation.attributes.blog_meta_keywords'),
            'category_blog_id' => __('validation.attributes.blog_category_blog_id'),
            'tags' => __('validation.attributes.blog_tags'),
        ];
    }
}
