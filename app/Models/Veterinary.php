<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Veterinary extends Model
{
    use HasFactory;

protected $table = "veterinarians";

protected $fillable = [
        'license_number','specialization', 'years_experience', 'clinic_name', 'profile_img', 'address',
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
        return $this->hasMany(Availability::class, 'veterinary_id');
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
