<?php

namespace App\common;

use App\Models\Pet;
use App\common\DTO;
use Illuminate\Http\Request;

class PetDTO extends DTO
{
    public ?int $id;
    public ?string $uuid;
    public int $client_id;
    public int $species_id;
    public ?int $breed_id;
    public string $name;
    public ?string $gender;
    public ?string $date_of_birth;
    public ?string $color;
    public ?string $weight;
    public ?string $microchip_number;
    public ?string $medical_history;
    public ?string $dietary_restrictions;
    public ?string $behavioral_notes;
    public ?string $image_url;
    public ?string $deworming_date;
    public ?string $rabies_vaccination_date;
    public ?string $sterilization_date;
    public ?string $last_vet_visit;
    public ?string $next_vaccination_date;
    public ?string $insurance_details;
    public ?string $created_at;
    public ?string $updated_at;
    public ?string $deleted_at;

    public function __construct(
        ?int $id = null,
        ?string $uuid = null,
        int $client_id = 0,
        int $species_id = 0,
        ?int $breed_id = null,
        string $name = '',
        ?string $gender = null,
        ?string $date_of_birth = null,
        ?string $color = null,
        ?string $weight = null,
        ?string $microchip_number = null,
        ?string $medical_history = null,
        ?string $dietary_restrictions = null,
        ?string $behavioral_notes = null,
        ?string $image_url = null,
        ?string $deworming_date = null,
        ?string $rabies_vaccination_date = null,
        ?string $sterilization_date = null,
        ?string $last_vet_visit = null,
        ?string $next_vaccination_date = null,
        ?string $insurance_details = null,
        ?string $created_at = null,
        ?string $updated_at = null,
        ?string $deleted_at = null
    ) {
        $this->id = $id;
        $this->uuid = $uuid;
        $this->client_id = $client_id;
        $this->species_id = $species_id;
        $this->breed_id = $breed_id;
        $this->name = $name;
        $this->gender = $gender;
        $this->date_of_birth = $date_of_birth;
        $this->color = $color;
        $this->weight = $weight;
        $this->microchip_number = $microchip_number;
        $this->medical_history = $medical_history;
        $this->dietary_restrictions = $dietary_restrictions;
        $this->behavioral_notes = $behavioral_notes;
        $this->image_url = $image_url;
        $this->deworming_date = $deworming_date;
        $this->rabies_vaccination_date = $rabies_vaccination_date;
        $this->sterilization_date = $sterilization_date;
        $this->last_vet_visit = $last_vet_visit;
        $this->next_vaccination_date = $next_vaccination_date;
        $this->insurance_details = $insurance_details;
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
            species_id: $data['species_id'] ?? 0,
            breed_id: $data['breed_id'] ?? null,
            name: $data['name'] ?? '',
            gender: $data['gender'] ?? null,
            date_of_birth: $data['date_of_birth'] ?? null,
            color: $data['color'] ?? null,
            weight: $data['weight'] ?? null,
            microchip_number: $data['microchip_number'] ?? null,
            medical_history: $data['medical_history'] ?? null,
            dietary_restrictions: $data['dietary_restrictions'] ?? null,
            behavioral_notes: $data['behavioral_notes'] ?? null,
            image_url: $data['image_url'] ?? null,
            deworming_date: $data['deworming_date'] ?? null,
            rabies_vaccination_date: $data['rabies_vaccination_date'] ?? null,
            sterilization_date: $data['sterilization_date'] ?? null,
            last_vet_visit: $data['last_vet_visit'] ?? null,
            next_vaccination_date: $data['next_vaccination_date'] ?? null,
            insurance_details: $data['insurance_details'] ?? null,
            created_at: $data['created_at'] ?? null,
            updated_at: $data['updated_at'] ?? null,
            deleted_at: $data['deleted_at'] ?? null
        );
    }

    public function toCreateArray(): array
    {
        return [
            'client_id' => $this->client_id,
            'species_id' => $this->species_id,
            'breed_id' => $this->breed_id,
            'name' => $this->name,
            'gender' => $this->gender,
            'date_of_birth' => $this->date_of_birth,
            'color' => $this->color,
            'weight' => $this->weight,
            'microchip_number' => $this->microchip_number,
            'medical_history' => $this->medical_history,
            'dietary_restrictions' => $this->dietary_restrictions,
            'behavioral_notes' => $this->behavioral_notes,
            'image_url' => $this->image_url,
            'deworming_date' => $this->deworming_date,
            'rabies_vaccination_date' => $this->rabies_vaccination_date,
            'sterilization_date' => $this->sterilization_date,
            'last_vet_visit' => $this->last_vet_visit,
            'next_vaccination_date' => $this->next_vaccination_date,
            'insurance_details' => $this->insurance_details,
        ];
    }

    public function toArray(): array
    {
        return [
            'uuid' => $this->uuid,
            'client_id' => $this->client_id,
            'species_id' => $this->species_id,
            'breed_id' => $this->breed_id,
            'name' => $this->name,
            'gender' => $this->gender,
            'date_of_birth' => $this->date_of_birth,
            'color' => $this->color,
            'weight' => $this->weight,
            'microchip_number' => $this->microchip_number,
            'medical_history' => $this->medical_history,
            'dietary_restrictions' => $this->dietary_restrictions,
            'behavioral_notes' => $this->behavioral_notes,
            'image_url' => $this->image_url,
            'deworming_date' => $this->deworming_date,
            'rabies_vaccination_date' => $this->rabies_vaccination_date,
            'sterilization_date' => $this->sterilization_date,
            'last_vet_visit' => $this->last_vet_visit,
            'next_vaccination_date' => $this->next_vaccination_date,
            'insurance_details' => $this->insurance_details,
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
            'species_id' => $this->species_id,
            'breed_id' => $this->breed_id,
            'name' => $this->name,
            'gender' => $this->gender,
            'date_of_birth' => $this->date_of_birth,
            'color' => $this->color,
            'weight' => $this->weight,
            'microchip_number' => $this->microchip_number,
            'medical_history' => $this->medical_history,
            'dietary_restrictions' => $this->dietary_restrictions,
            'behavioral_notes' => $this->behavioral_notes,
            'image_url' => $this->image_url,
            'deworming_date' => $this->deworming_date,
            'rabies_vaccination_date' => $this->rabies_vaccination_date,
            'sterilization_date' => $this->sterilization_date,
            'last_vet_visit' => $this->last_vet_visit,
            'next_vaccination_date' => $this->next_vaccination_date,
            'insurance_details' => $this->insurance_details,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

    public function toUpdateArray(): array
    {
        $data = [];
        
        if ($this->client_id > 0) {
            $data['client_id'] = $this->client_id;
        }
        
        if ($this->species_id > 0) {
            $data['species_id'] = $this->species_id;
        }
        
        if ($this->breed_id !== null) {
            $data['breed_id'] = $this->breed_id;
        }
        
        if (!empty($this->name)) {
            $data['name'] = $this->name;
        }
        
        if ($this->gender !== null) {
            $data['gender'] = $this->gender;
        }
        
        if ($this->date_of_birth !== null) {
            $data['date_of_birth'] = $this->date_of_birth;
        }
        
        if ($this->color !== null) {
            $data['color'] = $this->color;
        }
        
        if ($this->weight !== null) {
            $data['weight'] = $this->weight;
        }
        
        if ($this->microchip_number !== null) {
            $data['microchip_number'] = $this->microchip_number;
        }
        
        if ($this->medical_history !== null) {
            $data['medical_history'] = $this->medical_history;
        }
        
        if ($this->dietary_restrictions !== null) {
            $data['dietary_restrictions'] = $this->dietary_restrictions;
        }
        
        if ($this->behavioral_notes !== null) {
            $data['behavioral_notes'] = $this->behavioral_notes;
        }
        
        if ($this->image_url !== null) {
            $data['image_url'] = $this->image_url;
        }
        
        if ($this->deworming_date !== null) {
            $data['deworming_date'] = $this->deworming_date;
        }
        
        if ($this->rabies_vaccination_date !== null) {
            $data['rabies_vaccination_date'] = $this->rabies_vaccination_date;
        }
        
        if ($this->sterilization_date !== null) {
            $data['sterilization_date'] = $this->sterilization_date;
        }
        
        if ($this->last_vet_visit !== null) {
            $data['last_vet_visit'] = $this->last_vet_visit;
        }
        
        if ($this->next_vaccination_date !== null) {
            $data['next_vaccination_date'] = $this->next_vaccination_date;
        }
        
        if ($this->insurance_details !== null) {
            $data['insurance_details'] = $this->insurance_details;
        }
        
        return $data;
    }
}
