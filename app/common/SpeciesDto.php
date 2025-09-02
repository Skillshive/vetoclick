<?php

namespace App\common;

use App\common\DTO;
use Illuminate\Http\Request;

class SpeciesDto extends DTO
{
    public ?int $id;
    public ?string $uuid;
    public string $name;
    public ?string $description;
    public ?int $image_id;
    public $image_file;
    public ?string $created_at;
    public ?string $updated_at;
    public ?string $deleted_at;

    public function __construct(
        ?int $id = null,
        ?string $uuid = null,
        string $name = '',
        ?string $description = null,
        ?int $image_id = null,
        $image_file = null,
        ?string $created_at = null,
        ?string $updated_at = null,
        ?string $deleted_at = null
    ) {
        $this->id = $id;
        $this->uuid = $uuid;
        $this->name = $name;
        $this->description = $description;
        $this->image_id = $image_id;
        $this->image_file = $image_file;
        $this->created_at = $created_at;
        $this->updated_at = $updated_at;
        $this->deleted_at = $deleted_at;
    }

    protected static function fromArray(array $data): self
    {
        return new self(
            id: $data['id'] ?? null,
            uuid: $data['uuid'] ?? null,
            name: $data['name'] ?? '',
            description: $data['description'] ?? null,
            image_id: $data['image_id'] ?? null,
            image_file: $data['image_file'] ?? null,
            created_at: $data['created_at'] ?? null,
            updated_at: $data['updated_at'] ?? null,
            deleted_at: $data['deleted_at'] ?? null
        );
    }

    public static function fromRequest(Request $request)
    {
        $data = $request->all();

        // Handle image file separately since it's not included in $request->all()
        if ($request->hasFile('image')) {
            $data['image_file'] = $request->file('image');
        }

        return static::fromArray($data);
    }

    public function toArray(): array
    {
        return [
            'uuid' => $this->uuid,
            'name' => $this->name,
            'description' => $this->description,
            'image_id' => $this->image_id,
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
            'description' => $this->description,
            'image_id' => $this->image_id,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

    public function toCreateArray(): array
    {
        return [
            'name' => $this->name,
            'description' => $this->description,
            'image_id' => $this->image_id,
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

        if ($this->image_id !== null) {
            $data['image_id'] = $this->image_id;
        }

        return $data;
    }
}
