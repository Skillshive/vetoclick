<?php

namespace App\Models;

use App\Traits\HasImage;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Blog extends Model
{
    use HasFactory, SoftDeletes,HasImage;

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
        'tags',
    ];



    public function categoryBlog()
    {
        return $this->belongsTo(CategoryBlog::class, 'category_blog_id')->withTrashed();
    }

  

    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at',
    ];
}