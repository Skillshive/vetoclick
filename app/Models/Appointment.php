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
        'video_provider', 'video_auto_record', 'video_meeting_id', 'video_join_url',
        'video_start_url', 'video_password', 'video_recording_status', 'video_recording_url',
        'reason_for_visit', 'appointment_notes'
    ];

    protected $casts = [
        'is_video_conseil' => 'boolean',
        'video_auto_record' => 'boolean',
    ];

    public function veterinary()
    {
        return $this->belongsTo(Veterinary::class);
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
