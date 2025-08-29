<?php

namespace App\common;

use App\common\DTO;

class ClientDTO extends DTO
{
    public ?int $id;
    public ?string $uuid;
    public int $user_id;
    public ?string $address;
    public ?string $city;
    public ?string $state;
    public ?string $postal_code;
    public ?string $country;
    public ?string $phone;
    public ?string $emergency_contact_name;
    public ?string $emergency_contact_phone;
    public ?string $notes;
    public ?string $preferred_communication_method;
    public ?string $profile_picture_url;
    public ?string $created_at;
    public ?string $updated_at;
    public ?string $deleted_at;

    public function __construct(
        ?int $id = null,
        ?string $uuid = null,
        int $user_id = 0,
        ?string $address = null,
        ?string $city = null,
        ?string $state = null,
        ?string $postal_code = null,
        ?string $country = null,
        ?string $phone = null,
        ?string $emergency_contact_name = null,
        ?string $emergency_contact_phone = null,
        ?string $notes = null,
        ?string $preferred_communication_method = null,
        ?string $profile_picture_url = null,
        ?string $created_at = null,
        ?string $updated_at = null,
        ?string $deleted_at = null
    ) {
        $this->id = $id;
        $this->uuid = $uuid;
        $this->user_id = $user_id;
        $this->address = $address;
        $this->city = $city;
        $this->state = $state;
        $this->postal_code = $postal_code;
        $this->country = $country;
        $this->phone = $phone;
        $this->emergency_contact_name = $emergency_contact_name;
        $this->emergency_contact_phone = $emergency_contact_phone;
        $this->notes = $notes;
        $this->preferred_communication_method = $preferred_communication_method;
        $this->profile_picture_url = $profile_picture_url;
        $this->created_at = $created_at;
        $this->updated_at = $updated_at;
        $this->deleted_at = $deleted_at;
    }

    protected static function fromArray(array $data): self
    {
        return new self(
            id: $data['id'] ?? null,
            uuid: $data['uuid'] ?? null,
            user_id: $data['user_id'] ?? 0,
            address: $data['address'] ?? null,
            city: $data['city'] ?? null,
            state: $data['state'] ?? null,
            postal_code: $data['postal_code'] ?? null,
            country: $data['country'] ?? null,
            phone: $data['phone'] ?? null,
            emergency_contact_name: $data['emergency_contact_name'] ?? null,
            emergency_contact_phone: $data['emergency_contact_phone'] ?? null,
            notes: $data['notes'] ?? null,
            preferred_communication_method: $data['preferred_communication_method'] ?? null,
            profile_picture_url: $data['profile_picture_url'] ?? null,
            created_at: $data['created_at'] ?? null,
            updated_at: $data['updated_at'] ?? null,
            deleted_at: $data['deleted_at'] ?? null
        );
    }

    public function toArray(): array
    {
        return [
            'uuid' => $this->uuid,
            'user_id' => $this->user_id,
            'address' => $this->address,
            'city' => $this->city,
            'state' => $this->state,
            'postal_code' => $this->postal_code,
            'country' => $this->country,
            'phone' => $this->phone,
            'emergency_contact_name' => $this->emergency_contact_name,
            'emergency_contact_phone' => $this->emergency_contact_phone,
            'notes' => $this->notes,
            'preferred_communication_method' => $this->preferred_communication_method,
            'profile_picture_url' => $this->profile_picture_url,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'deleted_at' => $this->deleted_at,
        ];
    }

    public function toFrontendArray(): array
    {
        return [
            'uuid' => $this->uuid,
            'user_id' => $this->user_id,
            'address' => $this->address,
            'city' => $this->city,
            'state' => $this->state,
            'postal_code' => $this->postal_code,
            'country' => $this->country,
            'phone' => $this->phone,
            'emergency_contact_name' => $this->emergency_contact_name,
            'emergency_contact_phone' => $this->emergency_contact_phone,
            'notes' => $this->notes,
            'preferred_communication_method' => $this->preferred_communication_method,
            'profile_picture_url' => $this->profile_picture_url,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

    public function toCreateArray(): array
    {
        return [
            'user_id' => $this->user_id,
            'address' => $this->address,
            'city' => $this->city,
            'state' => $this->state,
            'postal_code' => $this->postal_code,
            'country' => $this->country,
            'phone' => $this->phone,
            'emergency_contact_name' => $this->emergency_contact_name,
            'emergency_contact_phone' => $this->emergency_contact_phone,
            'notes' => $this->notes,
            'preferred_communication_method' => $this->preferred_communication_method,
            'profile_picture_url' => $this->profile_picture_url,
        ];
    }

    public function toUpdateArray(): array
    {
        $data = [];
        
        if ($this->user_id > 0) {
            $data['user_id'] = $this->user_id;
        }
        
        if ($this->address !== null) {
            $data['address'] = $this->address;
        }
        
        if ($this->city !== null) {
            $data['city'] = $this->city;
        }
        
        if ($this->state !== null) {
            $data['state'] = $this->state;
        }
        
        if ($this->postal_code !== null) {
            $data['postal_code'] = $this->postal_code;
        }
        
        if ($this->country !== null) {
            $data['country'] = $this->country;
        }
        
        if ($this->phone !== null) {
            $data['phone'] = $this->phone;
        }
        
        if ($this->emergency_contact_name !== null) {
            $data['emergency_contact_name'] = $this->emergency_contact_name;
        }
        
        if ($this->emergency_contact_phone !== null) {
            $data['emergency_contact_phone'] = $this->emergency_contact_phone;
        }
        
        if ($this->notes !== null) {
            $data['notes'] = $this->notes;
        }
        
        if ($this->preferred_communication_method !== null) {
            $data['preferred_communication_method'] = $this->preferred_communication_method;
        }
        
        if ($this->profile_picture_url !== null) {
            $data['profile_picture_url'] = $this->profile_picture_url;
        }
        
        return $data;
    }
}
