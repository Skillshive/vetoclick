<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Consultation extends Model
{
    use HasFactory;

    protected $fillable = [
        'appointment_id', 'veterinary_id', 'client_id', 'pet_id',
        'conseil_date', 'start_time', 'end_time', 'conseil_notes',
        'follow_up_required', 'follow_up_date', 'conseil_fee', 'status'
    ];

    public function appointment()
    {
        return $this->belongsTo(Appointment::class);
    }

    public function veterinary()
    {
        return $this->belongsTo(Veterinary::class);
    }

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function pet()
    {
        return $this->belongsTo(Pet::class);
    }

    

    public function vaccinations()
    {
        return $this->hasMany(Vaccination::class, 'conseil_id');
    }

    public function prescriptions()
    {
        return $this->hasMany(Prescription::class);
    }

    public function allergies()
    {
        return $this->hasMany(Allergy::class, 'conseil_id');
    }
}
