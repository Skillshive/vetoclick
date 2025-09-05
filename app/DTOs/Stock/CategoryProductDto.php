<?php

namespace App\DTOs\Stock;

use App\common\DTO;
use App\Interfaces\DTOInterface;
use Illuminate\Http\Request;

class CategoryProductDto extends DTO implements DTOInterface
{
    public function __construct(
        public ?int $id = null,
        public ?string $uuid = null,
        public string $name = '',
        public ?string $description = null,
        public ?string $category_product_id = null,
        public ?string $created_at = null,
        public ?string $updated_at = null,
        public ?string $deleted_at = null
    ) {}


    public static function fromRequest(Request $request): self
    {
        return new self(
            name: $request->input('name', ''),
            description: $request->input('description'),
            category_product_id: $request->input('category_product_id')
        );
    }
}
