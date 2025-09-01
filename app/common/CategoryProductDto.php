<?php

namespace App\common;

use App\Interfaces\DTOInterface;
use Illuminate\Http\Request;

class CategoryProductDto extends DTO implements DTOInterface
{
    public function __construct(
        public ?int $id = null,
        public ?string $uuid = null,
        public string $name = '',
        public ?string $description = null,
        public ?int $category_product_id = null,
        public ?string $created_at = null,
        public ?string $updated_at = null,
        public ?string $deleted_at = null
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            id: $data['id'] ?? null,
            uuid: $data['uuid'] ?? null,
            name: $data['name'] ?? '',
            description: $data['description'] ?? null,
            category_product_id: $data['category_product_id'] ?? null,
            created_at: $data['created_at'] ?? null,
            updated_at: $data['updated_at'] ?? null,
            deleted_at: $data['deleted_at'] ?? null
        );
    }

    public static function fromRequest(Request $request): self
    {
        return new self(
            name: $request->input('name', ''),
            description: $request->input('description'),
            category_product_id: $request->input('category_product_id')
        );
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'name' => $this->name,
            'description' => $this->description,
            'category_product_id' => $this->category_product_id,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'deleted_at' => $this->deleted_at,
        ];
    }

    public function toFrontendArray(): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'name' => $this->name,
            'description' => $this->description,
            'category_product_id' => $this->category_product_id,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

    public function toCreateArray(): array
    {
        return [
            'name' => $this->name,
            'description' => $this->description,
            'category_product_id' => $this->category_product_id,
        ];
    }

    public function toUpdateArray(): array
    {
        $data = [];
        
        if (!empty($this->name)) {
            $data['name'] = $this->name;
        }
        
        if ($this->description !== null) {
            $data['description'] = $this->description;
        }
        
        if ($this->category_product_id !== null) {
            $data['category_product_id'] = $this->category_product_id;
        }
        
        return $data;
    }
}
