<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Allergy extends Model
{
    use HasFactory;

    protected $fillable = [
        'pet_id',
        'allergy_name',
        'reaction',
        'notes',
    ];

    public function pet()
    {
        return $this->belongsTo(Pet::class);
    }
}
