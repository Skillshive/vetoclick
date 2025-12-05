<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Prescription extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'uuid',
        'pet_id',
    'consultation_id',
        'veterinarian_id',
        'product_id',
        'medication',
        'dosage',
        'frequency',
        'duration',
        'instructions',
        'prescribed_date',
    ];

    protected $casts = [
        'prescribed_date' => 'date',
        'duration' => 'integer',
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($prescription) {
            if (empty($prescription->uuid)) {
                $prescription->uuid = (string) Str::uuid();
            }
        });
    }

    public function pet(): BelongsTo
    {
        return $this->belongsTo(Pet::class);
    }

    public function consultation(): BelongsTo
    {
        return $this->belongsTo(Consultation::class);
    }

    public function veterinarian(): BelongsTo
    {
        return $this->belongsTo(Veterinary::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
