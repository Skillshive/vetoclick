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

    protected static function fromArray(array $data): self
    {
        return new self(
            uuid: $data['uuid'] ?? null,
            veterinarian_id: $data['veterinarian_id'] ?? 0,
            day_of_week: $data['day_of_week'] ?? '',
            start_time: $data['start_time'] ?? '',
            end_time: $data['end_time'] ?? '',
            created_at: $data['created_at'] ?? null,
            updated_at: $data['updated_at'] ?? null,
            deleted_at: $data['deleted_at'] ?? null
        );
    }

    public function toCreateArray(): array
    {
        return [
            'veterinarian_id' => $this->veterinarian_id,
            'day_of_week' => $this->day_of_week,
            'start_time' => $this->start_time,
            'end_time' => $this->end_time,
        ];
    }

    public function toArray(): array
    {
        return [
            'uuid' => $this->uuid,
            'veterinarian_id' => $this->veterinarian_id,
            'day_of_week' => $this->day_of_week,
            'start_time' => $this->start_time,
            'end_time' => $this->end_time,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'deleted_at' => $this->deleted_at,
        ];
    }

    public function toFrontendArray(): array
    {
        return [
            'uuid' => $this->uuid,
            'veterinarian_id' => $this->veterinarian_id,
            'day_of_week' => $this->day_of_week,
            'start_time' => $this->start_time,
            'end_time' => $this->end_time,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

    public function toUpdateArray(): array
    {
        $data = [];
        
        if ($this->veterinarian_id > 0) {
            $data['veterinarian_id'] = $this->veterinarian_id;
        }
        
        if (!empty($this->day_of_week)) {
            $data['day_of_week'] = $this->day_of_week;
        }
        
        if (!empty($this->start_time)) {
            $data['start_time'] = $this->start_time;
        }
        
        if (!empty($this->end_time)) {
            $data['end_time'] = $this->end_time;
        }
        
        return $data;
    }
}