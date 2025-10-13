<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class VaccinationSchedule extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'uuid',
        'name',
        'description',
        'target_species',
        'age_weeks_min',
        'age_weeks_max',
        'is_active',
    ];

    protected $casts = [
        'target_species' => 'array',
        'is_active' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($schedule) {
            $schedule->uuid = Str::uuid();
        });
    }

    public function products()
    {
        return $this->belongsToMany(Product::class, 'vaccine_schedule_products')
                    ->withPivot(['sequence_order', 'age_weeks', 'interval_weeks', 'is_required', 'notes'])
                    ->withTimestamps();
    }
}
