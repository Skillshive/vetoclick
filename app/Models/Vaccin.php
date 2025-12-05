<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class Vaccin extends Model
{
    use HasFactory;

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($vaccin) {
            if (!$vaccin->uuid) {
                $vaccin->uuid = Str::uuid();
            }
        });
    }

    protected $fillable = [
        'vaccin_name',
        'description',
        'species_type',
    ];

    public function vaccinations()
    {
        return $this->hasMany(Vaccination::class, 'vaccine_id');
    }
}
