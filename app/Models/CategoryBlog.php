<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class CategoryBlog extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'category_blogs';
    protected static function boot()
    {
        parent::boot();
        static::creating(function ($categoryBlog) {
            $categoryBlog->uuid = Str::uuid();
        });
    }

    protected $fillable = [
        'name',
        'desp',
        'parent_category_id',
    ];

    public function parentCategory()
    {
        return $this->belongsTo(CategoryBlog::class, 'parent_category_id');
    }

    public function childCategories()
    {
        return $this->hasMany(CategoryBlog::class, 'parent_category_id');
    }

    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at',
    ];
}