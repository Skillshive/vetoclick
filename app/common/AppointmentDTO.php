<?php

namespace App\common;

use App\common\DTO;
use Illuminate\Http\Request;

class AppointmentDTO extends DTO
{
    public ?string $veterinarian_id;
    public ?string $client_id;
    public ?string $pet_id;
    public ?string $appointment_type;
    public ?string $appointment_date;
    public ?string $start_time;
    public ?string $end_time;
    public ?int $duration_minutes;
    public ?string $is_video_conseil;
    public ?string $meeting_provider;
    public bool $auto_record;
    public ?string $reason_for_visit;
    public ?string $appointment_notes;

    public function __construct(
        ?string $veterinarian_id = null,
        ?string $client_id = null,
        ?string $pet_id = null,
        ?string $appointment_type = null,
        ?string $appointment_date = null,
        ?string $start_time = null,
        ?string $end_time = null,
        ?int $duration_minutes = null,
        ?string $is_video_conseil = null,
        ?string $meeting_provider = null,
        bool $auto_record = false,
        ?string $reason_for_visit = null,
        ?string $appointment_notes = null,
    ) {
        $this->veterinarian_id = $veterinarian_id;
        $this->client_id = $client_id;
        $this->pet_id = $pet_id;
        $this->appointment_type = $appointment_type;
        $this->appointment_date = $appointment_date;
        $this->start_time = $start_time;
        $this->end_time = $end_time;
        $this->duration_minutes = $duration_minutes;
        $this->is_video_conseil = $is_video_conseil;
        $this->meeting_provider = $meeting_provider;
        $this->auto_record = $auto_record;
        $this->reason_for_visit = $reason_for_visit;
        $this->appointment_notes = $appointment_notes;
    }

    public static function fromRequest(Request $req): self
    {
        return new self(
            veterinarian_id: $req->input('veterinarian_id'),
            client_id: $req->input('client_id'),
            pet_id: $req->input('pet_id'),
            appointment_type: $req->input('appointment_type'),
            appointment_date: $req->input('appointment_date'),
            start_time: $req->input('start_time'),
            end_time: $req->input('end_time'),
            duration_minutes: $req->filled('duration_minutes') ? (int) $req->input('duration_minutes') : null,
            is_video_conseil: $req->input('is_video_conseil'),
            meeting_provider: $req->input('meeting_provider'),
            auto_record: (bool) $req->boolean('auto_record'),
            reason_for_visit: $req->input('reason_for_visit'),
            appointment_notes: $req->input('appointment_notes'),
        );
}
}
