<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Receptionist extends Model
{
    protected $fillable = [
        'user_id',
        'veterinarian_id',
    ];

    /**
     * The user account for this receptionist.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * The veterinary (clinic / vet) this receptionist works with.
     */
    public function veterinary()
    {
        return $this->belongsTo(Veterinary::class, 'veterinarian_id');
    }
}


