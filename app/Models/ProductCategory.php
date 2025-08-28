<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProductCategory extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'category_products';

    protected $fillable = [
        'uuid',
        'name',
        'description',
        'category_product_id',
    ];

    public function parent()
    {
        return $this->belongsTo(ProductCategory::class, 'category_product_id');
    }

    public function children()
    {
        return $this->hasMany(ProductCategory::class, 'category_product_id');
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }
}
