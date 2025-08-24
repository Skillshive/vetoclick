<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Lot extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'order_id',
        'reference',
        'expiry_date',
        'shelf_life_unit',
        'shelf_life',
        'initial_quantity',
        'current_quantity',
        'selling_price',
        'status',
        'notes',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($lot) {
            $lot->uuid = Str::uuid();
        });
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
