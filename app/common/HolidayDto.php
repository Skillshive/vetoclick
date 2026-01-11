<?php

namespace App\common;

use App\common\DTO;
use Illuminate\Http\Request;

class HolidayDto extends DTO
{
    public ?string $uuid;
    public int $veterinarian_id;
    public string $start_date;
    public string $end_date;
    public ?string $reason;
    public ?string $created_at;
    public ?string $updated_at;
    public ?string $deleted_at;

    public function __construct(
        ?string $uuid = null,
        int $veterinarian_id = 0,
        string $start_date = '',
        string $end_date = '',
        ?string $reason = null,
        ?string $created_at = null,
        ?string $updated_at = null,
        ?string $deleted_at = null
    ) {
        $this->uuid = $uuid;
        $this->veterinarian_id = $veterinarian_id;
        $this->start_date = $start_date;
        $this->end_date = $end_date;
        $this->reason = $reason;
        $this->created_at = $created_at;
        $this->updated_at = $updated_at;
        $this->deleted_at = $deleted_at;
    }

    public function toArray(): array
    {
        return [
            'veterinarian_id' => $this->veterinarian_id,
            'start_date' => $this->start_date,
            'end_date' => $this->end_date,
            'reason' => $this->reason,
        ];
    }

    public static function fromRequest(Request $request): self
    {
        return new self(
            veterinarian_id: $request->input('veterinarian_id'),
            start_date: $request->input('start_date'),
            end_date: $request->input('end_date'),
            reason: $request->input('reason'),
        );
    }
}

