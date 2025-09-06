<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Blog extends Model
{
    use HasFactory, SoftDeletes;

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($blog) {
            $blog->uuid = Str::uuid();
        });
    }

    protected $fillable = [
        'title',
        'body',
        'caption',
        'image_id',
        'meta_title',
        'meta_desc',
        'meta_keywords',
        'category_blog_id',
    ];

    public function image()
    {
        return $this->belongsTo(Image::class);
    }

    public function categoryBlog()
    {
        return $this->belongsTo(CategoryBlog::class);
    }

  

    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at',
    ];
}