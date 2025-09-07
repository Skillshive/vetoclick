<?php

namespace App\DTOs;

use App\common\DTO;
use App\Interfaces\DTOInterface;
use Illuminate\Http\Request;

class CategoryBlogDto extends DTO implements DTOInterface
{
    public function __construct(
        public string $name = '',
        public ?string $desp = null,
        public ?string $parent_category_id = null,
    ) {}

    public static function fromRequest(Request $request): self
    {
        return new self(
            name: $request->input('name', ''),
            desp: $request->input('desp'),
            parent_category_id: $request->input('parent_category_id')
        );
    }
}