<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Breed extends Model
{
    use HasFactory;

    protected $fillable = [
        'species',            // Animal species (Dog, Cat, Bird, etc.)
        'breed_name',         
        'avg_weight_kg',      
        'life_span_years',    
        'common_health_issues'
    ];

    // Relationships

    // One breed can have many pets
    public function pets()
    {
        return $this->hasMany(Pet::class);
    }

    // Optional: one breed can have multiple vaccination schedules
    
}
