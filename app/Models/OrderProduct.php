<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class OrderProduct extends Model
{
    use HasFactory;
    protected static function boot()
    {
        parent::boot();
        static::creating(function ($orderProduct) {
            $orderProduct->uuid = Str::uuid();
        });
    }               
    protected $table = "order_products";
    protected $fillable = [
    'order_id',
    'product_id',
    'quantity',
    'unit_price',
    'tva',
    'reduction_taux',
    'total_price',
];    
public function product()
{
    return $this->belongsTo(Product::class);
}

public function order()
{
    return $this->belongsTo(Order::class);
}
}
