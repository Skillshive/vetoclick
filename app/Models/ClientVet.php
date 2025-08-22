<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class ClientVet extends Pivot
{
    protected $table = 'clients_vets';

    protected $fillable = [
        'client_id', 'vet_id'
    ];
}
