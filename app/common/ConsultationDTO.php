<?php

namespace App\common;

use App\common\DTO;

class ConsultationDTO extends DTO
{
    public ?int $id;
    public ?string $uuid;
    public int $appointment_id;
    public int $veterinary_id;
    public int $pet_id;
    public string $diagnosis;
    public ?string $treatment_plan;
    public ?string $prescription_details;
    public ?string $follow_up_date;
    public ?float $weight;
    public ?float $temperature;
    public ?string $heart_rate;
    public ?string $respiratory_rate;
    public ?string $notes;
    public string $status;
    public ?string $created_at;
    public ?string $updated_at;
    public ?string $deleted_at;

    public function __construct(
        ?int $id = null,
        ?string $uuid = null,
        int $appointment_id = 0,
        int $veterinary_id = 0,
        int $pet_id = 0,
        string $diagnosis = '',
        ?string $treatment_plan = null,
        ?string $prescription_details = null,
        ?string $follow_up_date = null,
        ?float $weight = null,
        ?float $temperature = null,
        ?string $heart_rate = null,
        ?string $respiratory_rate = null,
        ?string $notes = null,
        string $status = '',
        ?string $created_at = null,
        ?string $updated_at = null,
        ?string $deleted_at = null
    ) {
        $this->id = $id;
        $this->uuid = $uuid;
        $this->appointment_id = $appointment_id;
        $this->veterinary_id = $veterinary_id;
        $this->pet_id = $pet_id;
        $this->diagnosis = $diagnosis;
        $this->treatment_plan = $treatment_plan;
        $this->prescription_details = $prescription_details;
        $this->follow_up_date = $follow_up_date;
        $this->weight = $weight;
        $this->temperature = $temperature;
        $this->heart_rate = $heart_rate;
        $this->respiratory_rate = $respiratory_rate;
        $this->notes = $notes;
        $this->status = $status;
        $this->created_at = $created_at;
        $this->updated_at = $updated_at;
        $this->deleted_at = $deleted_at;
    }

    protected static function fromArray(array $data): self
    {
        return new self(
            id: $data['id'] ?? null,
            uuid: $data['uuid'] ?? null,
            appointment_id: $data['appointment_id'] ?? 0,
            veterinary_id: $data['veterinary_id'] ?? 0,
            pet_id: $data['pet_id'] ?? 0,
            diagnosis: $data['diagnosis'] ?? '',
            treatment_plan: $data['treatment_plan'] ?? null,
            prescription_details: $data['prescription_details'] ?? null,
            follow_up_date: $data['follow_up_date'] ?? null,
            weight: $data['weight'] ?? null,
            temperature: $data['temperature'] ?? null,
            heart_rate: $data['heart_rate'] ?? null,
            respiratory_rate: $data['respiratory_rate'] ?? null,
            notes: $data['notes'] ?? null,
            status: $data['status'] ?? '',
            created_at: $data['created_at'] ?? null,
            updated_at: $data['updated_at'] ?? null,
            deleted_at: $data['deleted_at'] ?? null
        );
    }

    public function toArray(): array
    {
        return [
            'uuid' => $this->uuid,
            'appointment_id' => $this->appointment_id,
            'veterinary_id' => $this->veterinary_id,
            'pet_id' => $this->pet_id,
            'diagnosis' => $this->diagnosis,
            'treatment_plan' => $this->treatment_plan,
            'prescription_details' => $this->prescription_details,
            'follow_up_date' => $this->follow_up_date,
            'weight' => $this->weight,
            'temperature' => $this->temperature,
            'heart_rate' => $this->heart_rate,
            'respiratory_rate' => $this->respiratory_rate,
            'notes' => $this->notes,
            'status' => $this->status,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'deleted_at' => $this->deleted_at,
        ];
    }

    public function toFrontendArray(): array
    {
        return [
            'uuid' => $this->uuid,
            'appointment_id' => $this->appointment_id,
            'veterinary_id' => $this->veterinary_id,
            'pet_id' => $this->pet_id,
            'diagnosis' => $this->diagnosis,
            'treatment_plan' => $this->treatment_plan,
            'prescription_details' => $this->prescription_details,
            'follow_up_date' => $this->follow_up_date,
            'weight' => $this->weight,
            'temperature' => $this->temperature,
            'heart_rate' => $this->heart_rate,
            'respiratory_rate' => $this->respiratory_rate,
            'notes' => $this->notes,
            'status' => $this->status,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

    public function toCreateArray(): array
    {
        return [
            'appointment_id' => $this->appointment_id,
            'veterinary_id' => $this->veterinary_id,
            'pet_id' => $this->pet_id,
            'diagnosis' => $this->diagnosis,
            'treatment_plan' => $this->treatment_plan,
            'prescription_details' => $this->prescription_details,
            'follow_up_date' => $this->follow_up_date,
            'weight' => $this->weight,
            'temperature' => $this->temperature,
            'heart_rate' => $this->heart_rate,
            'respiratory_rate' => $this->respiratory_rate,
            'notes' => $this->notes,
            'status' => $this->status,
        ];
    }

    public function toUpdateArray(): array
    {
        $data = [];
        
        if ($this->appointment_id > 0) {
            $data['appointment_id'] = $this->appointment_id;
        }
        
        if ($this->veterinary_id > 0) {
            $data['veterinary_id'] = $this->veterinary_id;
        }
        
        if ($this->pet_id > 0) {
            $data['pet_id'] = $this->pet_id;
        }
        
        if (!empty($this->diagnosis)) {
            $data['diagnosis'] = $this->diagnosis;
        }
        
        if ($this->treatment_plan !== null) {
            $data['treatment_plan'] = $this->treatment_plan;
        }
        
        if ($this->prescription_details !== null) {
            $data['prescription_details'] = $this->prescription_details;
        }
        
        if ($this->follow_up_date !== null) {
            $data['follow_up_date'] = $this->follow_up_date;
        }
        
        if ($this->weight !== null) {
            $data['weight'] = $this->weight;
        }
        
        if ($this->temperature !== null) {
            $data['temperature'] = $this->temperature;
        }
        
        if ($this->heart_rate !== null) {
            $data['heart_rate'] = $this->heart_rate;
        }
        
        if ($this->respiratory_rate !== null) {
            $data['respiratory_rate'] = $this->respiratory_rate;
        }
        
        if ($this->notes !== null) {
            $data['notes'] = $this->notes;
        }
        
        if (!empty($this->status)) {
            $data['status'] = $this->status;
        }
        
        return $data;
    }
}
