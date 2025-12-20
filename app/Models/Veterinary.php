<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Veterinary extends Model
{
    use HasFactory;

    protected $table = "veterinarians";

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($veterinary) {
            if (empty($veterinary->uuid)) {
                $veterinary->uuid = Str::uuid();
            }
        });
    }

    protected $fillable = [
        'uuid',
        'license_number','specialization', 'years_experience', 'clinic_name', 'profile_img', 'address',
        'consultation_price',
        'subscription_plan_id', 'subscription_status', 'subscription_start_date',
        'subscription_end_date'
    ];

    // Relations
    public function clients()
    {
        return $this->belongsToMany(Client::class, 'clients_vets', 'vet_id', 'client_id');
    }

    public function availabilitySchedules()
    {
        return $this->hasMany(Availability::class, 'veterinarian_id');
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class, 'veterinary_id');
    }

    public function vaccinations()
    {
        return $this->hasMany(Vaccination::class, 'vet_id');
    }


    public function user(){
        return $this->belongsTo(User::class);
    }
  
}
