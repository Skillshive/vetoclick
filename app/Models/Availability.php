<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
class Availability extends Model
{
    use HasFactory;

    protected static function boot(){
        parent::boot();
        static::creating(function ($availability) {
            $availability->uuid = Str::uuid();
        });
    }

    protected $fillable = [
        'veterinarian_id',
        'day_of_week',
        'start_time',
        'end_time',
        'is_break',
        'session',
    ];

    public function veterinarian()
    {
        return $this->belongsTo(Veterinary::class, 'veterinarian_id');
    }

    protected $casts = [
        'is_break' => 'boolean',
    ];

    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at',
    ];
}