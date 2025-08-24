<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Invoice extends Model
{
    use HasFactory;

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($invoice) {
            $invoice->uuid = Str::uuid();
        });
    }
    protected $fillable = [
        'order_id',
        'reference',
        'invoice_date',
        'invoice_status',
        'invoice_file',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class, 'order_id');
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }
}
