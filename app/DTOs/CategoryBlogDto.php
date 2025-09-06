<?php

namespace App\DTOs;

use App\common\DTO;
use App\Interfaces\DTOInterface;
use Illuminate\Http\Request;

class CategoryBlogDto extends DTO implements DTOInterface
{
    public function __construct(
        public ?int $id = null,
        public ?string $uuid = null,
        public string $name = '',
        public ?string $desp = null,
        public ?int $parent_category_id = null,
        public ?string $created_at = null,
        public ?string $updated_at = null,
        public ?string $deleted_at = null
    ) {}

    public static function fromRequest(Request $request): self
    {
        return new self(
            name: $request->input('name', ''),
            desp: $request->input('desp'),
            parent_category_id: $request->input('parent_category_id')
        );
    }

    protected static function fromArray(array $data): self
    {
        return new self(
            id: $data['id'] ?? null,
            uuid: $data['uuid'] ?? null,
            name: $data['name'] ?? '',
            desp: $data['desp'] ?? null,
            parent_category_id: $data['parent_category_id'] ?? null,
            created_at: $data['created_at'] ?? null,
            updated_at: $data['updated_at'] ?? null,
            deleted_at: $data['deleted_at'] ?? null
        );
    }

    public function toCreateArray(): array
    {
        return [
            'name' => $this->name,
            'desp' => $this->desp,
            'parent_category_id' => $this->parent_category_id,
        ];
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'name' => $this->name,
            'desp' => $this->desp,
            'parent_category_id' => $this->parent_category_id,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'deleted_at' => $this->deleted_at,
        ];
    }

    public function toFrontendArray(): array
    {
        return [
            'uuid' => $this->uuid,
            'name' => $this->name,
            'desp' => $this->desp,
            'parent_category_id' => $this->parent_category_id,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

    public function toUpdateArray(): array
    {
        $data = [];
        
        if (!empty($this->name)) {
            $data['name'] = $this->name;
        }
        
        if ($this->desp !== null) {
            $data['desp'] = $this->desp;
        }
        
        if ($this->parent_category_id !== null) {
            $data['parent_category_id'] = $this->parent_category_id;
        }
        
        return $data;
    }
}