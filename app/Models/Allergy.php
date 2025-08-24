<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Allergy extends Model
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
        'medical_record_id',
        'allergen_type',
        'allergen_detail',
        'start_date',
        'reaction_description',
        'severity_level',
        'resolved_status',
        'resolution_date',
        'treatment_given',
    ];

    public function pet()
    {
        return $this->belongsTo(Pet::class);
    }

    public function medicalRecord()
    {
        return $this->belongsTo(MedicalRecord::class);
    }
}
