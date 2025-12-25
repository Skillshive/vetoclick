<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Appointment extends Model
{
    use HasFactory;

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($user) {
            $user->uuid = Str::uuid();
        });
    }
    
    protected $fillable = [
        'veterinarian_id', 'client_id', 'pet_id', 'appointment_type', 'appointment_date',
        'start_time', 'end_time', 'duration_minutes', 'status', 'is_video_conseil',
        'video_meeting_id', 'video_join_url', 'reason_for_visit', 'appointment_notes'
    ];

    protected $casts = [
        'appointment_date' => 'date',
    ];

    public function veterinary()
    {
        return $this->belongsTo(Veterinary::class, 'veterinarian_id');
    }

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function pet()
    {
        return $this->belongsTo(Pet::class);
    }

    public function consultation()
    {
        return $this->hasOne(Consultation::class);
    }
}
