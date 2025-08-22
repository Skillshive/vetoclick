<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Supplier extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'address', 'city', 'postal_code', 'country', 'is_active'
    ];

    public function contacts()
    {
        return $this->hasMany(SupplierContact::class);
    }

    public function inventory()
    {
        return $this->hasMany(Inventory::class);
    }
}
