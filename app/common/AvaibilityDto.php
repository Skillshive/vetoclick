<?php

namespace App\common;

use App\common\DTO;
use Illuminate\Http\Request;

class AvaibilityDto extends DTO
{
    public ?string $uuid;
    public int $veterinarian_id;
    public string $day_of_week;
    public string $start_time;
    public string $end_time;
    public ?string $created_at;
    public ?string $updated_at;
    public ?string $deleted_at;

    public function __construct(
        ?string $uuid = null,
        int $veterinarian_id = 0,
        string $day_of_week = '',
        string $start_time = '',
        string $end_time = '',
        ?string $created_at = null,
        ?string $updated_at = null,
        ?string $deleted_at = null
    ) {
        $this->uuid = $uuid;
        $this->veterinarian_id = $veterinarian_id;
        $this->day_of_week = $day_of_week;
        $this->start_time = $start_time;
        $this->end_time = $end_time;
        $this->created_at = $created_at;
        $this->updated_at = $updated_at;
        $this->deleted_at = $deleted_at;
    }

     public function toArray(): array
    {
        return [
            'veterinarian_id'  => $this->veterinarian_id,
            'day_of_week'      => $this->day_of_week,
            'start_time'       => $this->start_time,
            'end_time'         => $this->end_time
        ];
    }

 public static function fromRequest(Request $request): self
    {
        return new self(
            veterinarian_id: $request->input('veterinarian_id'),
            day_of_week: $request->input('day_of_week'),
            start_time: $request->input('start_time'),
            end_time: $request->input('end_time'),
        );
    }
}