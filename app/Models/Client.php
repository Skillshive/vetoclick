<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    use HasFactory;

    protected $fillable = [
        'first_name', 'last_name', 'email', 'phone', 'mobile',
        'address', 'city', 'postal_code'
    ];

    public function veterinarians()
    {
        return $this->belongsToMany(Veterinary::class, 'clients_vets', 'client_id', 'vet_id');
    }

    public function pets()
    {
        return $this->hasMany(Pet::class);
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }
}
