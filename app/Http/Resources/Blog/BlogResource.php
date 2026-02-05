<?php

namespace App\Http\Resources\Blog;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BlogResource extends JsonResource
{
    /**
     * Parse tags from various formats (JSON string, comma-separated, or array)
     *
     * @param mixed $tags
     * @return array
     */
    private function parseTags($tags): array
    {
        if (empty($tags)) {
            return [];
        }

        // If it's already an array, return it
        if (is_array($tags)) {
            return array_map('trim', $tags);
        }

        // Try to decode as JSON first (handles JSON strings like ["tag1","tag2"])
        $decoded = json_decode($tags, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            return array_map('trim', $decoded);
        }

        // Otherwise, treat as comma-separated string
        return array_map('trim', explode(',', $tags));
    }

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
            'content' => $this->body, 
            'description' => $this->caption ?: $this->body,
            'caption' => $this->caption,
            'meta_title' => $this->meta_title,
            'meta_desc' => $this->meta_desc,
            'meta_keywords' => $this->meta_keywords,
            'tags' => $this->parseTags($this->tags),
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
            'is_published' => $this->is_published ?? false,
            'is_featured' => $this->is_featured ?? false,
            'publish_date' => $this->publish_date ? (is_string($this->publish_date) ? $this->publish_date : $this->publish_date->toISOString()) : null,
            'reading_time' => $this->reading_time,
            'author' => $this->when($this->author, function () {
                return [
                    'id' => $this->author?->id,
                    'name' => $this->author?->name,
                    'email' => $this->author?->email,
                ];
            }),
            'author_id' => $this->author_id,
            'created_at' => $this->created_at ? $this->created_at->toISOString() : null,
            'updated_at' => $this->updated_at ? $this->updated_at->toISOString() : null,
        ];
    }
}

