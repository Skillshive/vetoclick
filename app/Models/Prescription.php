<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Prescription extends Model
{
    use HasFactory;

    protected $fillable = [
        'medical_record_id',
        'medication_name',
        'dosage',
        'frequency',
        'instructions',
        'start_date',
        'end_date',
    ];

    public function medicalRecord()
    {
        return $this->belongsTo(MedicalRecord::class);
    }
}
