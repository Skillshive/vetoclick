<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class MedicalRecord extends Model
{
    use HasFactory;

    protected static function boot(){
        
    parent::boot();
    static::creating(function ($medicalRecord) {
        $medicalRecord->uuid = Str::uuid();
    });
    }
    protected $fillable = [
        'consultation_id',
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

    public function consultation()
    {
        return $this->belongsTo(Consultation::class);
    }
}
