<?php

namespace App\DTOs;

use App\common\DTO;
use App\Interfaces\DTOInterface;
use Illuminate\Http\Request;

class PermissionDto extends DTO implements DTOInterface
{
    public function __construct(
        public string $name = '',
        public string $guard_name = 'web',
        public ?int $grp_id = null,
    ) {
    }

    public static function fromRequest(Request $request): self
    {
        return new self(
            name: $request->input('name', ''),
            guard_name: $request->input('guard_name', 'web'),
            grp_id: $request->input('grp_id'),
        );
    }
}
