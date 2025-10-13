<?php

namespace App\DTOs;

use App\common\DTO;
use App\Interfaces\DTOInterface;
use Illuminate\Http\Request;

class ProductDto extends DTO implements DTOInterface
{
    public function __construct(
        public string $name = '',
        public ?string $sku = null,
        public ?int $category_product_id = null,
        public ?string $brand = null,
        public ?string $description = null,
        public ?string $barcode = null,
        public ?int $type = null,
        public ?string $dosage_form = null,
        public ?array $target_species = null,
        public ?string $administration_route = null,
        public ?bool $prescription_required = null,
        public ?int $minimum_stock_level = null,
        public ?int $maximum_stock_level = null,
        public ?bool $is_active = null,
        public ?int $availability_status = null,
        public ?string $notes = null,
        public ?int $image_id = null,
        public ?string $manufacturer = null,
        public ?string $batch_number = null,
        public ?string $expiry_date = null,
        public ?float $dosage_ml = null,
        public ?string $vaccine_instructions = null
    ) {}

    public static function fromRequest(Request $request): self
    {
        $dto = new self(
            name: $request->input('name', ''),
            sku: $request->input('sku') ?: null,
            category_product_id: $request->input('category_product_id') ?: null,
            brand: $request->input('brand') ?: null,
            description: $request->input('description') ?: null,
            barcode: $request->input('barcode') ?: null,
            type: $request->input('type') ?: null,
            dosage_form: $request->input('dosage_form') ?: null,
            target_species: $request->input('target_species') ?: null,
            administration_route: $request->input('administration_route') ?: null,
            prescription_required: $request->boolean('prescription_required'),
            minimum_stock_level: $request->input('minimum_stock_level') ?: null,
            maximum_stock_level: $request->input('maximum_stock_level') ?: null,
            is_active: $request->boolean('is_active'),
            availability_status: $request->input('availability_status') ?: null,
            notes: $request->input('notes') ?: null,
            image_id: $request->input('image_id') ?: null,
            manufacturer: $request->input('manufacturer') ?: null,
            batch_number: $request->input('batch_number') ?: null,
            expiry_date: $request->input('expiry_date') ?: null,
            dosage_ml: $request->input('dosage_ml') ?: null,
            vaccine_instructions: $request->input('vaccine_instructions') ?: null
        );
        
        return $dto;
    }
}
