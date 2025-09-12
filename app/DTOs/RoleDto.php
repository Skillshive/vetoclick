<?php

namespace App\DTOs;

use App\common\DTO;
use App\Interfaces\DTOInterface;
use Illuminate\Http\Request;

class RoleDto extends DTO implements DTOInterface
{
    public function __construct(
        public string $name = '',
        public ?string $description = null,
        public array $permissions = [],
    ) {
    }

    public static function fromRequest(Request $request): self
    {
        return new self(
            name: $request->input('name', ''),
            description: $request->input('description'),
            permissions: $request->input('permissions', []),
        );
    }
}
