<?php

namespace App\common;

use App\common\DTO;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;

class BreedDTO extends DTO
{
    public string $breed_name;
    public ?float $avg_weight_kg;
    public ?int $life_span_years;
    public int $species_id;
    public ?UploadedFile $image;

    public function __construct(
        string $breed_name = '',
        ?float $avg_weight_kg = null,
        ?int $life_span_years = null,
        int $species_id = 0,
        ?int $image = null
    ) {
        $this->breed_name = $breed_name;
        $this->avg_weight_kg = $avg_weight_kg;
        $this->life_span_years = $life_span_years;
        $this->species_id = $species_id;
        $this->image = $image;
    }

    public static function fromRequest(Request $request)
    {
         return new self(
            breed_name: $request->input('breed_name'),
            avg_weight_kg: $request->input('avg_weight_kg'),
            life_span_years: $request->input('life_span_years'),
            species_id: $request->input('species_id'),
            image: $request->file('image'),
        );
    }
}
