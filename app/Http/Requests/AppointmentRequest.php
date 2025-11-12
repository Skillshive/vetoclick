<?php

namespace App\Http\Requests;

use App\Models\Appointment;
use App\Models\Veterinary;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Validator;

class AppointmentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'client_id' => 'required|string|exists:clients,uuid',
            'pet_id' => 'nullable|string|exists:pets,uuid',
            'appointment_date' => 'required|date',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i',
            'duration_minutes' => 'nullable|integer|min:1|max:300',
            'is_video_conseil' => 'sometimes|boolean',
            'meeting_provider' => 'nullable|string|in:zoom,in_person,phone,other',
            'auto_record' => 'nullable|boolean',
            'reason_for_visit' => 'nullable|string',
            'appointment_notes' => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'client_id.required' => __('validation.client_id_required'),
            'client_id.exists' => __('validation.client_id_exists'),

            'pet_id.exists' => __('validation.pet_id_exists'),

            'appointment_date.required' => __('validation.appointment_date_required'),
            'appointment_date.date' => __('validation.appointment_date_date'),

            'start_time.required' => __('validation.start_time_required'),
            'start_time.date_format' => __('validation.start_time_date_format'),
            'end_time.date_format' => __('validation.end_time_date_format'),

            'duration_minutes.integer' => __('validation.duration_minutes_integer'),
            'duration_minutes.min' => __('validation.duration_minutes_min'),
            'duration_minutes.max' => __('validation.duration_minutes_max'),

            'is_video_conseil.boolean' => __('validation.is_video_conseil_boolean'),
            'auto_record.boolean' => __('validation.auto_record_boolean'),

            'reason_for_visit.string' => __('validation.reason_for_visit_string'),
            'appointment_notes.string' => __('validation.appointment_notes_string'),
        ];
    }

    protected function prepareForValidation(): void
    {
        if (!$this->filled('veterinarian_id') && $this->user()?->veterinary?->uuid) {
            $this->merge([
                'veterinarian_id' => $this->user()->veterinary->uuid,
            ]);
        }
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $appointmentDate = $this->input('appointment_date');
            $startTime = $this->input('start_time');

            if (!$appointmentDate || !$startTime) {
                return;
            }

            $timezone = config('app.timezone', 'UTC');
            $startDateTime = Carbon::createFromFormat('Y-m-d H:i', "{$appointmentDate} {$startTime}", $timezone);

            if ($startDateTime->lessThan(now($timezone))) {
                $validator->errors()->add('start_time', __('validation.appointment_in_past_not_allowed'));
                return;
            }

            $endTime = $this->input('end_time');
            $duration = $this->integer('duration_minutes') ?: null;

            if (empty($endTime) && empty($duration)) {
                $duration = 45;
            }

            $endDateTime = $endTime
                ? Carbon::createFromFormat('Y-m-d H:i', "{$appointmentDate} {$endTime}", $timezone)
                : (clone $startDateTime)->addMinutes((int) $duration);

            $veterinarianUuid = $this->input('veterinarian_id');

            if (!$veterinarianUuid) {
                return;
            }

            $veterinarianId = Veterinary::where('uuid', $veterinarianUuid)->value('id');

            if (!$veterinarianId) {
                return;
            }

            $start = $startDateTime->format('H:i:s');
            $end = $endDateTime->format('H:i:s');

            $overlapQuery = Appointment::where('veterinarian_id', $veterinarianId)
                ->where('appointment_date', $appointmentDate)
                ->where(function ($query) use ($start, $end) {
                    $query->where(function ($inner) use ($start, $end) {
                        $inner->where('start_time', '>=', $start)
                              ->where('start_time', '<', $end);
                    })->orWhere(function ($inner) use ($start, $end) {
                        $inner->where('end_time', '>', $start)
                              ->where('end_time', '<=', $end);
                    })->orWhere(function ($inner) use ($start, $end) {
                        $inner->where('start_time', '<=', $start)
                              ->where('end_time', '>=', $end);
                    });
                });

            if ($this->route('uuid')) {
                $overlapQuery->where('uuid', '!=', $this->route('uuid'));
            }

            if ($overlapQuery->exists()) {
                $validator->errors()->add('start_time', __('validation.appointment_time_conflict'));
            }
        });
    }
}
