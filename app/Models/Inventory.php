<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Inventory extends Model
{
    use HasFactory;

    protected $fillable = [
        'veterinary_id', 'item_name', 'item_type', 'sku', 'current_stock', 
        'minimum_stock_level', 'unit_cost', 'selling_price', 'expiry_date', 
        'supplier_id', 'last_restocked_date', 'notes'
    ];

    public function veterinary()
    {
        return $this->belongsTo(Veterinary::class);
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }
}
