<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Appointment extends Model
{
    use HasFactory;

    protected $fillable = [
        'veterinary_id', 'client_id', 'pet_id', 'appointment_type', 'appointment_date',
        'start_time', 'end_time', 'duration_minutes', 'status', 'is_video_conseil',
        'video_meeting_id', 'video_join_url', 'reason_for_visit', 'appointment_notes'
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
