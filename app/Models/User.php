<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;

use App\Traits\HasImage;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{               
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasImage, HasRoles;

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($user) {
            $user->uuid = Str::uuid();
        });
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'firstname',
        'lastname',
        'email',
        'phone',
        'image_id',
        'password',
        'google_id',
        'email_verified_at',
        'phone_verified_at',
        'phone_verified',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Scope a query to search users by name or email
     */
    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('firstname', 'like', "%{$search}%")
              ->orWhere('lastname', 'like', "%{$search}%")
              ->orWhere('email', 'like', "%{$search}%")
              ->orWhereRaw("CONCAT(firstname, ' ', lastname) LIKE ?", ["%{$search}%"]);
        });
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Get the veterinary record associated with the user.
     */
    public function veterinary()
    {
        return $this->hasOne(Veterinary::class,'user_id');
    }

    /**
     * Get the client record associated with the user.
     */
    public function client()
    {
        return $this->hasOne(Client::class, 'user_id');
    }

    /**
     * Get the receptionist record associated with the user (if any).
     */
    public function receptionist()
    {
        return $this->hasOne(\App\Models\Receptionist::class);
    }

    /**
     * Resolve the veterinary the user belongs to:
     * - if the user is a veterinarian, return their own veterinary record
     * - if the user is a receptionist, return the veterinary they are linked to
     * - otherwise, return null
     */
    public function scopedVeterinary(): ?Veterinary
    {
        if ($this->hasRole('veterinarian') && $this->veterinary) {
            return $this->veterinary;
        }

        if ($this->hasRole('receptionist') && $this->receptionist && $this->receptionist->veterinary) {
            return $this->receptionist->veterinary;
        }

        return null;
    }
}
