<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Allergy extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'uuid',
        'pet_id',
        'consultation_id',
        'veterinarian_id',
        'allergen_type',
        'allergen_detail',
        'start_date',
        'reaction_description',
        'severity_level',
        'resolved_status',
        'resolution_date',
        'treatment_given',
    ];

    protected $casts = [
        'start_date' => 'date',
        'resolution_date' => 'date',
        'resolved_status' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($allergy) {
            if (empty($allergy->uuid)) {
                $allergy->uuid = (string) Str::uuid();
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
        return $this->belongsTo(Veterinary::class, 'veterinarian_id');
    }
}
