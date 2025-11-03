<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class AppointmentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        return [
            'uuid' => $this->uuid,
            'veterinary_id' => $this->veterinary_id,
            'client_id' => $this->client_id,
            'pet_id' => $this->pet_id,
            'appointment_date' => $this->appointment_date,
            'start_time' => $this->start_time,
            'end_time' => $this->end_time,
            'duration_minutes' => $this->duration_minutes,
            'status' => $this->status,
            'is_video_conseil' => $this->is_video_conseil,
            'appointment_type' => $this->appointment_type,
            'reason_for_visit' => $this->reason_for_visit,
            'appointment_notes' => $this->appointment_notes,
            'client' => [
                "uuid"=>$this->client->uuid,
                "first_name"=>$this?->client?->first_name,
                "last_name"=>$this?->client?->last_name,
            ],
            'pet' => [
                "uuid"=>$this->pet->uuid,
                "name"=>$this?->pet?->name,
                "breed"=>$this?->pet?->breed?->breed_name,
            ],
        ];
    }
}