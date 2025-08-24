<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str; 
class Prescription extends Model
{
    use HasFactory;
protected static function boot(){
    parent::boot();
    static::creating(function ($prescription) {
        $prescription->uuid = Str::uuid();
    });
}
    protected $fillable = [
        'medical_record_id',
        'product_id',
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

    public function product(){
        return $this->belongsTo(Product::class);
    }
}
