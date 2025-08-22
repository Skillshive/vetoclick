<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MedicalRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'pet_id',
        'veterinarian_id',
        'record_date',
        'weight_kg',
        'temperature',
        'heart_rate',
        'respiratory_rate',
        'bcs',
        'examination_findings',
        'diagnosis',
        'treatment_plan',
        'recommendations',
        'follow_up_instructions',
    ];

    // Relationships

    public function pet()
    {
        return $this->belongsTo(Pet::class);
    }

    public function veterinarian()
    {
        return $this->belongsTo(Veterinary::class);
    }

    public function prescriptions()
    {
        return $this->hasMany(Prescription::class);
    }
}
