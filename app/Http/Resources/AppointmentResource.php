<?php

namespace App\Http\Resources;

    use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AppointmentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'uuid' => $this->uuid,
            'appointment_type' => $this->appointment_type,
            'appointment_date' => $this->appointment_date,
            'start_time' => $this->start_time,
            'end_time' => $this->end_time,
            'duration_minutes' => $this->duration_minutes,
            'status' => $this->status,
            'is_video_conseil' => $this->is_video_conseil,
            'video_meeting_id' => $this->video_meeting_id,
            'video_join_url' => $this->video_join_url,
            'reason_for_visit' => $this->reason_for_visit,
            'appointment_notes' => $this->appointment_notes,
            'pet' => $this->when($this->pet, function () {
                return [
                    'id' => $this->pet?->uuid,
                    'name' => $this->pet?->name,
                    'alt' => $this->pet?->breed?->breed_name,
                ];
            }),
            'client' => $this->when($this->client, function () {
                return [
                    'uuid' => $this->client?->uuid,
                    'name' => $this->client?->first_name. " ".$this->client?->last_name,
                ];
            }),
            'created_at' => $this->created_at,
        ];
    }
}

