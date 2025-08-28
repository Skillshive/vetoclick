<?php

namespace App\common;

use App\Http\Requests\CreateProductRequest;
use App\Http\Requests\UpdateProductRequest;

class ProductDto extends DTO
{
    public function __construct(
        public ?string $name = null,
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
        public ?array $images = null
    ) {}

    protected static function fromArray(array $data): self
    {
        return new self(
            name: $data['name'] ?? null,
            sku: $data['sku'] ?? null,
            category_product_id: $data['category_product_id'] ?? null,
            brand: $data['brand'] ?? null,
            description: $data['description'] ?? null,
            barcode: $data['barcode'] ?? null,
            type: $data['type'] ?? null,
            dosage_form: $data['dosage_form'] ?? null,
            target_species: $data['target_species'] ?? null,
            administration_route: $data['administration_route'] ?? null,
            prescription_required: $data['prescription_required'] ?? null,
            minimum_stock_level: $data['minimum_stock_level'] ?? null,
            maximum_stock_level: $data['maximum_stock_level'] ?? null,
            is_active: $data['is_active'] ?? null,
            availability_status: $data['availability_status'] ?? null,
            notes: $data['notes'] ?? null,
            images: $data['images'] ?? null
        );
    }

    public function toCreateArray(): array
    {
        $data = array_filter(get_object_vars($this), fn($value) => $value !== null);
        if (isset($data['target_species'])) {
            $data['target_species'] = json_encode($data['target_species']);
        }
        if (isset($data['images'])) {
            $data['images'] = json_encode($data['images']);
        }
        return $data;
    }

    public function toUpdateArray(): array
    {
        $data = [];
        if ($this->name !== null) {
            $data['name'] = $this->name;
        }
        if ($this->sku !== null) {
            $data['sku'] = $this->sku;
        }
        if ($this->category_product_id !== null) {
            $data['category_product_id'] = $this->category_product_id;
        }
        if ($this->brand !== null) {
            $data['brand'] = $this->brand;
        }
        if ($this->description !== null) {
            $data['description'] = $this->description;
        }
        if ($this->barcode !== null) {
            $data['barcode'] = $this->barcode;
        }
        if ($this->type !== null) {
            $data['type'] = $this->type;
        }
        if ($this->dosage_form !== null) {
            $data['dosage_form'] = $this->dosage_form;
        }
        if ($this->target_species !== null) {
            $data['target_species'] = json_encode($this->target_species);
        }
        if ($this->administration_route !== null) {
            $data['administration_route'] = $this->administration_route;
        }
        if ($this->prescription_required !== null) {
            $data['prescription_required'] = $this->prescription_required;
        }
        if ($this->minimum_stock_level !== null) {
            $data['minimum_stock_level'] = $this->minimum_stock_level;
        }
        if ($this->maximum_stock_level !== null) {
            $data['maximum_stock_level'] = $this->maximum_stock_level;
        }
        if ($this->is_active !== null) {
            $data['is_active'] = $this->is_active;
        }
        if ($this->availability_status !== null) {
            $data['availability_status'] = $this->availability_status;
        }
        if ($this->notes !== null) {
            $data['notes'] = $this->notes;
        }
        if ($this->images !== null) {
            $data['images'] = json_encode($this->images);
        }
        return $data;
    }
}
