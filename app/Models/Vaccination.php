<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vaccination extends Model
{
    use HasFactory;

    protected $fillable = [
        'pet_id', 'vaccin_id', 'conseil_id', 'date_given', 'vet_id',
        'injection_site', 'next_due_date', 'notes'
    ];

    public function pet()
    {
        return $this->belongsTo(Pet::class);
    }

    public function veterinarian()
    {
        return $this->belongsTo(Veterinary::class, 'vet_id');
    }

    public function consultation()
    {
        return $this->belongsTo(Consultation::class, 'conseil_id');
    }

    public function vaccine()
    {
        return $this->belongsTo(Vaccin::class, 'vaccin_id');
    }
}
