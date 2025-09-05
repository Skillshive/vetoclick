<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class CategoryProduct extends Model
{
    use HasFactory;
    
    protected static function boot()
    {
        parent::boot();
        static::creating(function ($user) {
            $user->uuid = Str::uuid();
        });
    }
    protected $fillable = [
        'uuid',
        'name',
        'description',
        'category_product_id'
    ];

    public function products()
    {
        return $this->hasMany(Product::class);
    }   
    public function parent_category()
    {
        return $this->belongsTo(CategoryProduct::class, 'category_product_id');
    }

    public function child_categories()
    {
        return $this->hasMany(CategoryProduct::class, 'category_product_id');
    }
}

