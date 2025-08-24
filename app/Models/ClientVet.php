<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Support\Str;

class ClientVet extends Pivot
{
protected static function boot()
{
    parent::boot();
    static::creating(function ($clientVet) {
        $clientVet->uuid = Str::uuid();
    });
}
    protected $table = 'clients_vets';

    protected $fillable = [
        'client_id', 'vet_id'
    ];
}
