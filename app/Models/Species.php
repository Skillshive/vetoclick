<?php

namespace App\Models;

use App\Traits\HasImage;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Species extends Model
{
    use HasFactory;
    use HasImage;

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($user) {
            $user->uuid = Str::uuid();
        });
    }

    protected $fillable = [
        'name',
        'description',
        'image_id',
    ];

    public function breeds()
    {
        return $this->hasMany(Breed::class);
    }
}
