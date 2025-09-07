<?php

namespace App\Models;

use App\Traits\HasImage;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Breed extends Model
{
    use HasFactory, HasImage;

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($user) {
            $user->uuid = Str::uuid();
        });
    }
    
    protected $fillable = [
        'species_id',
        'breed_name',
        'avg_weight_kg',
        'life_span_years',
        'image_id'
    ];

    public function pets()
    {
        return $this->hasMany(Pet::class);
    }
    
    public function species()
    {
        return $this->belongsTo(Species::class);
    }
}
