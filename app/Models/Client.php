<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Client extends Model
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
        'veterinarian_id', 'first_name', 'last_name', 'email', 'phone', 'fixe',
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

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
