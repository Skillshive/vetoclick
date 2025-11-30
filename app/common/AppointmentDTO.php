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
    public ?string $is_video_conseil;
    public ?string $reason_for_visit;
    public ?string $appointment_notes;

    public function __construct(
        ?string $veterinarian_id = null,
        ?string $client_id = null,
        ?string $pet_id = null,
        ?string $appointment_type = null,
        ?string $appointment_date = null,
        ?string $start_time = null,
        ?string $is_video_conseil = null,
        ?string $reason_for_visit = null,
        ?string $appointment_notes = null,
    ) {
        $this->veterinarian_id = $veterinarian_id;
        $this->client_id = $client_id;
        $this->pet_id = $pet_id;
        $this->appointment_type = $appointment_type;
        $this->appointment_date = $appointment_date;
        $this->start_time = $start_time;
        $this->is_video_conseil = $is_video_conseil;
        $this->reason_for_visit = $reason_for_visit;
        $this->appointment_notes = $appointment_notes;
    }

    public static function fromRequest(Request $req): self
    {
        return new self(
            veterinarian_id: $req->input('veterinary_id'),
            client_id: $req->input('client_id'),
            pet_id: $req->input('pet_id'),
            appointment_type: $req->input('appointment_type'),
            appointment_date: $req->input('appointment_date'),
            start_time: $req->input('start_time'),
            is_video_conseil: $req->input('is_video_conseil'),
            reason_for_visit: $req->input('reason_for_visit'),
            appointment_notes: $req->input('appointment_notes'),
        );
}
}
