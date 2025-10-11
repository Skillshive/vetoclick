<?php

namespace App\Http\Resources\Blog;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BlogResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'uuid' => $this->uuid,
            'title' => $this->title,
            'body' => $this->body,
            'caption' => $this->caption,
            'meta_title' => $this->meta_title,
            'meta_desc' => $this->meta_desc,
            'meta_keywords' => $this->meta_keywords,
            'tags' => $this->tags,
            'image' => $this->when($this->image, function () {
                return [
                    'id' => $this->image?->id,
                    'path' => $this->image?->path,
                    'alt' => $this->image?->name,
                ];
            }),
            'category_blog' => $this->when($this->categoryBlog, function () {
                return [
                    'uuid' => $this->categoryBlog?->uuid,
                    'name' => $this->categoryBlog?->name,
                ];
            }),
            'category_blog_id' => $this->category_blog_id,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}

