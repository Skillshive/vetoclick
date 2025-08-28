<?php

namespace App\common;

class ProductCategoryDto extends DTO
{
    public function __construct(
        public ?string $name = null,
        public ?string $description = null,
        public ?int $parent_id = null
    ) {}

    protected static function fromArray(array $data): self
    {
        return new self(
            name: $data['name'] ?? null,
            description: $data['description'] ?? null,
            parent_id: $data['parent_id'] ?? null
        );
    }

    public function toCreateArray(): array
    {
        return array_filter([
            'name' => $this->name,
            'description' => $this->description,
            'category_product_id' => $this->parent_id,
        ], fn ($value) => $value !== null);
    }

    public function toUpdateArray(): array
    {
        $data = [];

        if (!is_null($this->name)) {
            $data['name'] = $this->name;
        }

        if (!is_null($this->description)) {
            $data['description'] = $this->description;
        }

        if (!is_null($this->parent_id)) {
            $data['parent_id'] = $this->parent_id;
        }

        return $data;
    }
}
