<?php

namespace App\DTOs;

use App\common\DTO;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;

class SpeciesDto extends DTO
{
    public string $name;
    public ?string $description;
    public ?UploadedFile $image;

    public function __construct(
        string $name = '',
        ?string $description = null,
        $image = null,
    ) {
        $this->name = $name;
        $this->description = $description;
        $this->image = $image;
    }

    public static function fromRequest(Request $request)
    {
         return new self(
            name: $request->input('name'),
            description: $request->input('description'),
            image: $request->file('image'),
        );
    }
}
