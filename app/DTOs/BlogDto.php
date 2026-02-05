<?php

namespace App\DTOs;

use App\common\DTO;
use App\Interfaces\DTOInterface;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;

class BlogDto extends DTO implements DTOInterface
{
    public function __construct(
        public ?int $id = null,
        public ?string $uuid = null,
        public string $title = '',
        public string $body = '',
        public string $caption = '',
        public ?UploadedFile $image_file = null,
        public ?string $image_url = null,
        public bool $remove_existing_image = false,
        public string $meta_title = '',
        public string $meta_desc = '',
        public string $meta_keywords = '',
        public ?string $category_blog_uuid = null,
        public ?int $category_blog_id = null,
        public string $tags = '',
        public bool $is_published = false,
        public bool $is_featured = false,
        public ?string $publish_date = null,
        public ?int $reading_time = null,
        public ?int $author_id = null,
        public ?string $created_at = null,
        public ?string $updated_at = null,
        public ?string $deleted_at = null
    ) {}

    public static function fromRequest(Request $request): self
    {
        // Get category blog ID from UUID
        $categoryBlogUuid = $request->input('category_blog_id');
        $categoryBlogId = null;
        
        if ($categoryBlogUuid) {
            $categoryBlog = \App\Models\CategoryBlog::where('uuid', $categoryBlogUuid)->first();
            $categoryBlogId = $categoryBlog ? $categoryBlog->id : null;
        }

        // Calculate reading time from body (average reading speed: 200 words per minute)
        $body = $request->input('body', '');
        $wordCount = str_word_count(strip_tags($body));
        $readingTime = $wordCount > 0 ? max(1, ceil($wordCount / 200)) : null;

        return new self(
            title: $request->input('title', ''),
            body: $body,
            caption: $request->input('caption', ''),
            image_file: $request->file('image_file'),
            remove_existing_image: $request->boolean('remove_existing_image'),
            meta_title: $request->input('meta_title', ''),
            meta_desc: $request->input('meta_desc', ''),
            meta_keywords: $request->input('meta_keywords', ''),
            category_blog_uuid: $categoryBlogUuid,
            category_blog_id: $categoryBlogId,
            tags: $request->input('tags', ''),
            is_published: $request->boolean('is_published', false),
            is_featured: $request->boolean('is_featured', false),
            publish_date: $request->input('publish_date'),
            reading_time: $readingTime,
            author_id: $request->input('author_id') ? (int)$request->input('author_id') : null
        );
    }

    protected static function fromArray(array $data): self
    {
        return new self(
            id: $data['id'] ?? null,
            uuid: $data['uuid'] ?? null,
            title: $data['title'] ?? '',
            body: $data['body'] ?? '',
            caption: $data['caption'] ?? '',
            image_file: $data['image_file'] ?? null,
            image_url: $data['image_url'] ?? $data['image'] ?? null,
            meta_title: $data['meta_title'] ?? '',
            meta_desc: $data['meta_desc'] ?? '',
            meta_keywords: $data['meta_keywords'] ?? '',
            category_blog_uuid: $data['category_blog_uuid'] ?? null,
            category_blog_id: $data['category_blog_id'] ?? null,
            tags: $data['tags'] ?? '',
            created_at: $data['created_at'] ?? null,
            updated_at: $data['updated_at'] ?? null,
            deleted_at: $data['deleted_at'] ?? null
        );
    }

    public function toCreateArray(): array
    {
        return [
            'title' => $this->title,
            'body' => $this->body,
            'caption' => $this->caption,
            'image_file' => $this->image_file,
            'image' => $this->image_url,
            'meta_title' => $this->meta_title,
            'meta_desc' => $this->meta_desc,
            'meta_keywords' => $this->meta_keywords,
            'category_blog_id' => $this->category_blog_id,
            'tags' => $this->tags,
            'is_published' => $this->is_published,
            'is_featured' => $this->is_featured,
            'publish_date' => $this->publish_date,
            'reading_time' => $this->reading_time,
            'author_id' => $this->author_id,
        ];
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'title' => $this->title,
            'body' => $this->body,
            'caption' => $this->caption,
            'image_file' => $this->image_file,
            'image' => $this->image_url,
            'meta_title' => $this->meta_title,
            'meta_desc' => $this->meta_desc,
            'meta_keywords' => $this->meta_keywords,
            'category_blog_uuid' => $this->category_blog_uuid,
            'category_blog_id' => $this->category_blog_id,
            'tags' => $this->tags,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'deleted_at' => $this->deleted_at,
        ];
    }

    public function toFrontendArray(): array
    {
        return [
            'uuid' => $this->uuid,
            'title' => $this->title,
            'body' => $this->body,
            'caption' => $this->caption,
            'image' => $this->image_url,
            'meta_title' => $this->meta_title,
            'meta_desc' => $this->meta_desc,
            'meta_keywords' => $this->meta_keywords,
            'category_blog_uuid' => $this->category_blog_uuid,
            'category_blog_id' => $this->category_blog_id,
            'tags' => $this->tags,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

    public function toUpdateArray(): array
    {
        $data = [];

        if (!empty($this->title)) {
            $data['title'] = $this->title;
        }

        if (!empty($this->body)) {
            $data['body'] = $this->body;
        }

        if (!empty($this->caption)) {
            $data['caption'] = $this->caption;
        }

        if ($this->image_file !== null) {
            $data['image_file'] = $this->image_file;
        }

        if ($this->image_url !== null) {
            $data['image'] = $this->image_url;
        }

        if (!empty($this->meta_title)) {
            $data['meta_title'] = $this->meta_title;
        }

        if (!empty($this->meta_desc)) {
            $data['meta_desc'] = $this->meta_desc;
        }

        if (!empty($this->meta_keywords)) {
            $data['meta_keywords'] = $this->meta_keywords;
        }

        if ($this->category_blog_id !== null) {
            $data['category_blog_id'] = $this->category_blog_id;
        }

        if (!empty($this->tags)) {
            $data['tags'] = $this->tags;
        }

        if (isset($this->is_published)) {
            $data['is_published'] = $this->is_published;
        }

        if (isset($this->is_featured)) {
            $data['is_featured'] = $this->is_featured;
        }

        if ($this->publish_date !== null) {
            $data['publish_date'] = $this->publish_date;
        }

        if ($this->reading_time !== null) {
            $data['reading_time'] = $this->reading_time;
        }

        if ($this->author_id !== null) {
            $data['author_id'] = $this->author_id;
        }

        return $data;
    }
}