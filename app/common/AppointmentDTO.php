<?php

namespace App\common;

use App\common\DTO;

class AppointmentDTO extends DTO
{
    public ?int $id;
    public ?string $uuid;
    public int $client_id;
    public ?int $pet_id;
    public int $veterinary_id;
    public string $title;
    public string $description;
    public string $start_time;
    public string $end_time;
    public string $status;
    public ?string $type;
    public ?string $location;
    public ?string $notes;
    public ?string $cancellation_reason;
    public ?string $reminder_sent_at;
    public ?string $created_at;
    public ?string $updated_at;
    public ?string $deleted_at;

    public function __construct(
        ?int $id = null,
        ?string $uuid = null,
        int $client_id = 0,
        ?int $pet_id = null,
        int $veterinary_id = 0,
        string $title = '',
        string $description = '',
        string $start_time = '',
        string $end_time = '',
        string $status = '',
        ?string $type = null,
        ?string $location = null,
        ?string $notes = null,
        ?string $cancellation_reason = null,
        ?string $reminder_sent_at = null,
        ?string $created_at = null,
        ?string $updated_at = null,
        ?string $deleted_at = null
    ) {
        $this->id = $id;
        $this->uuid = $uuid;
        $this->client_id = $client_id;
        $this->pet_id = $pet_id;
        $this->veterinary_id = $veterinary_id;
        $this->title = $title;
        $this->description = $description;
        $this->start_time = $start_time;
        $this->end_time = $end_time;
        $this->status = $status;
        $this->type = $type;
        $this->location = $location;
        $this->notes = $notes;
        $this->cancellation_reason = $cancellation_reason;
        $this->reminder_sent_at = $reminder_sent_at;
        $this->created_at = $created_at;
        $this->updated_at = $updated_at;
        $this->deleted_at = $deleted_at;
    }

    protected static function fromArray(array $data): self
    {
        return new self(
            id: $data['id'] ?? null,
            uuid: $data['uuid'] ?? null,
            client_id: $data['client_id'] ?? 0,
            pet_id: $data['pet_id'] ?? null,
            veterinary_id: $data['veterinary_id'] ?? 0,
            title: $data['title'] ?? '',
            description: $data['description'] ?? '',
            start_time: $data['start_time'] ?? '',
            end_time: $data['end_time'] ?? '',
            status: $data['status'] ?? '',
            type: $data['type'] ?? null,
            location: $data['location'] ?? null,
            notes: $data['notes'] ?? null,
            cancellation_reason: $data['cancellation_reason'] ?? null,
            reminder_sent_at: $data['reminder_sent_at'] ?? null,
            created_at: $data['created_at'] ?? null,
            updated_at: $data['updated_at'] ?? null,
            deleted_at: $data['deleted_at'] ?? null
        );
    }

    public function toArray(): array
    {
        return [
            'uuid' => $this->uuid,
            'client_id' => $this->client_id,
            'pet_id' => $this->pet_id,
            'veterinary_id' => $this->veterinary_id,
            'title' => $this->title,
            'description' => $this->description,
            'start_time' => $this->start_time,
            'end_time' => $this->end_time,
            'status' => $this->status,
            'type' => $this->type,
            'location' => $this->location,
            'notes' => $this->notes,
            'cancellation_reason' => $this->cancellation_reason,
            'reminder_sent_at' => $this->reminder_sent_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'deleted_at' => $this->deleted_at,
        ];
    }

    public function toFrontendArray(): array
    {
        return [
            'uuid' => $this->uuid,
            'client_id' => $this->client_id,
            'pet_id' => $this->pet_id,
            'veterinary_id' => $this->veterinary_id,
            'title' => $this->title,
            'description' => $this->description,
            'start_time' => $this->start_time,
            'end_time' => $this->end_time,
            'status' => $this->status,
            'type' => $this->type,
            'location' => $this->location,
            'notes' => $this->notes,
            'cancellation_reason' => $this->cancellation_reason,
            'reminder_sent_at' => $this->reminder_sent_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

    public function toCreateArray(): array
    {
        return [
            'client_id' => $this->client_id,
            'pet_id' => $this->pet_id,
            'veterinary_id' => $this->veterinary_id,
            'title' => $this->title,
            'description' => $this->description,
            'start_time' => $this->start_time,
            'end_time' => $this->end_time,
            'status' => $this->status,
            'type' => $this->type,
            'location' => $this->location,
            'notes' => $this->notes,
        ];
    }

    public function toUpdateArray(): array
    {
        $data = [];
        
        if ($this->client_id > 0) {
            $data['client_id'] = $this->client_id;
        }
        
        if ($this->pet_id !== null) {
            $data['pet_id'] = $this->pet_id;
        }
        
        if ($this->veterinary_id > 0) {
            $data['veterinary_id'] = $this->veterinary_id;
        }
        
        if (!empty($this->title)) {
            $data['title'] = $this->title;
        }
        
        if (!empty($this->description)) {
            $data['description'] = $this->description;
        }
        
        if (!empty($this->start_time)) {
            $data['start_time'] = $this->start_time;
        }
        
        if (!empty($this->end_time)) {
            $data['end_time'] = $this->end_time;
        }
        
        if (!empty($this->status)) {
            $data['status'] = $this->status;
        }
        
        if ($this->type !== null) {
            $data['type'] = $this->type;
        }
        
        if ($this->location !== null) {
            $data['location'] = $this->location;
        }
        
        if ($this->notes !== null) {
            $data['notes'] = $this->notes;
        }
        
        if ($this->cancellation_reason !== null) {
            $data['cancellation_reason'] = $this->cancellation_reason;
        }
        
        return $data;
    }
}
