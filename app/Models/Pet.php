<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pet extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_id', 'name', 'species', 'breed_id', 'sex', 'neutered_status',
        'dob', 'microchip_ref', 'profile_img', 'weight_kg', 'bcs', 'color', 'notes', 'deceased_at'
    ];

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function breed()
    {
        return $this->belongsTo(Breed::class);
    }

    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }

   

    public function vaccinations()
    {
        return $this->hasMany(Vaccination::class);
    }

    public function allergies()
    {
        return $this->hasMany(Allergy::class);
    }
}
