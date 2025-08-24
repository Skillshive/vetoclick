<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;
class Vaccination extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected static function boot(){
        parent::boot();
        static::creating(function ($vaccination) {
            $vaccination->uuid = Str::uuid();
        });
    }
    protected $fillable = [
        'consultation_id',
        'administered_by',
        'vaccine_id',
        'vaccination_date',
        'next_due_date',
    ];

    public function consultation()
    {
        return $this->belongsTo(Consultation::class);
    }

    public function vaccin()
    {
        return $this->belongsTo(Vaccin::class);
    }
}
