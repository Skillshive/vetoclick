<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use Carbon\Carbon;

class AppointmentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    /**
     * Format a date value safely
     */
    private function formatDate($date): ?string
    {
        if (!$date) {
            return null;
        }

        if ($date instanceof Carbon) {
            return $date->format('Y-m-d');
        }

        if (is_string($date)) {
            try {
                return Carbon::parse($date)->format('Y-m-d');
            } catch (\Exception $e) {
                return $date; // Return as-is if parsing fails
            }
        }

        return null;
    }

    public function toArray($request)
    {
        return [
            'uuid' => $this->uuid,
            'veterinary_id' => $this->veterinary_id,
            'client_id' => $this->client_id,
            'pet_id' => $this->pet_id,
            'appointment_date' => $this->formatDate($this->appointment_date),
            'start_time' => $this->start_time,
            'end_time' => $this->end_time,
            'duration_minutes' => $this->duration_minutes,
            'status' => $this->status,
            'is_video_conseil' => $this->is_video_conseil,
            'video_meeting_id' => $this->video_meeting_id,
            'video_join_url' => $this->video_join_url,
            'appointment_type' => $this->appointment_type,
            'reason_for_visit' => $this->reason_for_visit,
            'appointment_notes' => $this->appointment_notes,
            'client' => [
                "uuid"=>$this?->client?->uuid,
                "first_name"=>$this?->client?->first_name,
                "last_name"=>$this?->client?->last_name,
                "avatar"=>null, // Client model doesn't have avatar/profile_img field
            ],
            'pet' => [
                "uuid"=>$this?->pet?->uuid,
                "name"=>$this?->pet?->name,
                "breed"=>$this?->pet?->breed?->breed_name ?? null,
                "avatar"=>$this?->pet?->profile_img ? asset('storage/' . $this->pet->profile_img) : null,
                "microchip"=>$this?->pet?->microchip_ref ?? null,
                "species"=>$this?->pet?->breed?->species?->name ?? null,
                "gender"=>$this?->pet?->sex ?? null,
                "dob"=>$this->formatDate($this?->pet?->dob),
                "wieght"=>$this?->pet?->weight_kg ?? null,
            ],
        ];
    }
}