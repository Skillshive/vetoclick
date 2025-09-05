<?php

namespace App\common;

use App\common\DTO;
use Illuminate\Http\Request;

class AvaibilityDto extends DTO
{
    public ?int $id;
    public ?string $uuid;
    public int $veterinary_id;
    public string $day_of_week;
    public string $start_time;
    public string $end_time;
    public ?string $break_start_time;
    public ?string $break_end_time;
    public bool $is_available;
    public ?string $notes;
    public ?string $created_at;
    public ?string $updated_at;
    public ?string $deleted_at;

    public function __construct(
        ?int $id = null,
        ?string $uuid = null,
        int $veterinary_id = 0,
        string $day_of_week = '',
        string $start_time = '',
        string $end_time = '',
        ?string $break_start_time = null,
        ?string $break_end_time = null,
        bool $is_available = true,
        ?string $notes = null,
        ?string $created_at = null,
        ?string $updated_at = null,
        ?string $deleted_at = null
    ) {
        $this->id = $id;
        $this->uuid = $uuid;
        $this->veterinary_id = $veterinary_id;
        $this->day_of_week = $day_of_week;
        $this->start_time = $start_time;
        $this->end_time = $end_time;
        $this->break_start_time = $break_start_time;
        $this->break_end_time = $break_end_time;
        $this->is_available = $is_available;
        $this->notes = $notes;
        $this->created_at = $created_at;
        $this->updated_at = $updated_at;
        $this->deleted_at = $deleted_at;
    }

    protected static function fromArray(array $data): self
    {
        return new self(
            id: $data['id'] ?? null,
            uuid: $data['uuid'] ?? null,
            veterinary_id: $data['veterinary_id'] ?? 0,
            day_of_week: $data['day_of_week'] ?? '',
            start_time: $data['start_time'] ?? '',
            end_time: $data['end_time'] ?? '',
            break_start_time: $data['break_start_time'] ?? null,
            break_end_time: $data['break_end_time'] ?? null,
            is_available: $data['is_available'] ?? true,
            notes: $data['notes'] ?? null,
            created_at: $data['created_at'] ?? null,
            updated_at: $data['updated_at'] ?? null,
            deleted_at: $data['deleted_at'] ?? null
        );
    }

    public function toCreateArray(): array
    {
        return [
            'veterinary_id' => $this->veterinary_id,
            'day_of_week' => $this->day_of_week,
            'start_time' => $this->start_time,
            'end_time' => $this->end_time,
            'break_start_time' => $this->break_start_time,
            'break_end_time' => $this->break_end_time,
            'is_available' => $this->is_available,
            'notes' => $this->notes,
        ];
    }

    public function toArray(): array
    {
        return [
            'uuid' => $this->uuid,
            'veterinary_id' => $this->veterinary_id,
            'day_of_week' => $this->day_of_week,
            'start_time' => $this->start_time,
            'end_time' => $this->end_time,
            'break_start_time' => $this->break_start_time,
            'break_end_time' => $this->break_end_time,
            'is_available' => $this->is_available,
            'notes' => $this->notes,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'deleted_at' => $this->deleted_at,
        ];
    }

    public function toFrontendArray(): array
    {
        return [
            'uuid' => $this->uuid,
            'veterinary_id' => $this->veterinary_id,
            'day_of_week' => $this->day_of_week,
            'start_time' => $this->start_time,
            'end_time' => $this->end_time,
            'break_start_time' => $this->break_start_time,
            'break_end_time' => $this->break_end_time,
            'is_available' => $this->is_available,
            'notes' => $this->notes,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

    public function toUpdateArray(): array
    {
        $data = [];
        
        if ($this->veterinary_id > 0) {
            $data['veterinary_id'] = $this->veterinary_id;
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
        
        if ($this->break_start_time !== null) {
            $data['break_start_time'] = $this->break_start_time;
        }
        
        if ($this->break_end_time !== null) {
            $data['break_end_time'] = $this->break_end_time;
        }
        
        $data['is_available'] = $this->is_available;
        
        if ($this->notes !== null) {
            $data['notes'] = $this->notes;
        }
        
        return $data;
    }
}