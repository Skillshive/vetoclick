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
            'veterinarian_id' => $this->veterinarian_id,
            'client_id' => $this->client_id,
            'pet_id' => $this->pet_id,
            'appointment_date' => $this->appointment_date,
            'start_time' => $this->start_time,
            'end_time' => $this->end_time,
            'duration_minutes' => $this->duration_minutes,
            'status' => $this->status,
            'is_video_conseil' => $this->is_video_conseil,
            'video_provider' => $this->video_provider,
            'video_auto_record' => $this->video_auto_record,
            'video_meeting_id' => $this->video_meeting_id,
            'video_join_url' => $this->video_join_url,
            'video_start_url' => $this->video_start_url,
            'video_password' => $this->video_password,
            'video_recording_status' => $this->video_recording_status,
            'video_recording_url' => $this->video_recording_url,
            'appointment_type' => $this->appointment_type,
            'reason_for_visit' => $this->reason_for_visit,
            'appointment_notes' => $this->appointment_notes,
            'client' => [
                "uuid" => $this->client->uuid ?? null,
                "first_name" => $this->client->first_name ?? null,
                "last_name" => $this->client->last_name ?? null,
                "avatar" => $this->client->profile_img ?? null,
            ],
            'pet' => [
                "uuid" => $this?->pet?->uuid ?? null,
                "name" => $this?->pet?->name ?? null,
                "breed" => optional($this?->pet?->breed)->breed_name,
                "avatar" => $this?->pet?->profile_img ?? null,
                "species" => $this?->pet?->species ?? null,
                "gender" => $this?->pet?->sex ?? null,
                "microchip" => $this?->pet?->microchip_ref ?? null,
                "weight" => $this?->pet?->weight_kg ?? null,
            ],
        ];
    }
}