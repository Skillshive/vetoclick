<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;     

class Pet extends Model
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
        'client_id', 'name', 'breed_id', 'sex', 'neutered_status',
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
    public function allergies()
    {
        return $this->hasMany(Allergy::class);
    }

    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }

    public function consultations()
    {
        return $this->hasMany(Consultation::class);
    }

    public function medicalRecords()
    {
        return $this->hasManyThrough(MedicalRecord::class, Consultation::class);
    }

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName()
    {
        return 'uuid';
    }
}
