<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'brand',
        'description',
        'sku',
        'barcode',
        'category_product_id',
        'type',
        'dosage_form',
        'target_species',
        'administration_route',
        'prescription_required',
        'minimum_stock_level',
        'maximum_stock_level',
        'is_active',
        'availability_status',
        'notes',
        'images',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($product) {
            $product->uuid = Str::uuid();
        });
    }

    public function categoryProduct()
    {
        return $this->belongsTo(CategoryProduct::class);
    }
}
