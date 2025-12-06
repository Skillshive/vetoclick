<?php

namespace App\Models;

use App\Traits\HasImage;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
class Product extends Model
{
    use HasFactory,HasImage;

    protected $fillable = [
        'uuid',
        'name',
        'brand',
        'description',
        'sku',
        'barcode',
        'category_product_id',
        'type',
        'dosage_form',
        'target_species',
        'administration_route',
        'prescription_required',
        'minimum_stock_level',
        'maximum_stock_level',
        'is_active',
        'availability_status',
        'notes',
        'image_id',
        'manufacturer',
        'batch_number',
        'expiry_date',
        'dosage_ml',
        'vaccine_instructions',
        'veterinarian_id',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($product) {
            $product->uuid = Str::uuid();
        });
    }

    public function category()
    {
        return $this->belongsTo(ProductCategory::class, 'category_product_id');
    }

    public function vaccinationSchedules()
    {
        return $this->belongsToMany(VaccinationSchedule::class, 'vaccine_schedule_products')
                    ->withPivot(['sequence_order', 'age_weeks', 'interval_weeks', 'is_required', 'notes'])
                    ->withTimestamps();
    }
    public function veterinarian()
    {
        return $this->belongsTo(Veterinary::class, 'veterinarian_id');
    }
}
