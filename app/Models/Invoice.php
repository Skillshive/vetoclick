<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'conseil_id', 'client_id', 'veterinary_id', 'invoice_number',
        'invoice_date', 'due_date', 'subtotal', 'tax_amount', 'discount_amount',
        'total_amount', 'status', 'payment_method', 'paid_date', 'notes'
    ];

    public function consultation()
    {
        return $this->belongsTo(Consultation::class, 'conseil_id');
    }

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function veterinary()
    {
        return $this->belongsTo(Veterinary::class, 'veterinary_id');
    }

    

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
}
