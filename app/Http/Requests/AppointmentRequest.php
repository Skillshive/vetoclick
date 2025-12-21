<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

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
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Convert is_video_conseil to proper boolean
        if ($this->has('is_video_conseil')) {
            $value = $this->input('is_video_conseil');
            // Convert empty string, '0', 'false', etc. to false
            $this->merge([
                'is_video_conseil' => filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? false,
            ]);
        } else {
            // Default to false if not provided
            $this->merge(['is_video_conseil' => false]);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $now = now()->format('Y-m-d H:i:s');
        
        return [
            'veterinary_id' => 'required|string|exists:veterinarians,uuid',
            'client_id' => 'required|string|exists:clients,uuid',
            'pet_id' => 'nullable|string|exists:pets,uuid',
            'appointment_type' => 'required|string',
            'appointment_date' => 'required|date',
            'start_time' => 'required|date_format:H:i',
            'is_video_conseil' => 'sometimes|boolean',
            'reason_for_visit' => 'nullable|string',
            'appointment_notes' => 'nullable|string',
        ];
    }

     public function messages(): array
    {
        return [
            'veterinary_id.required' => __('validation.veterinary_id_required'),
            'veterinary_id.exists' => __('validation.veterinary_id_exists'),
            'appointment_type.required' => __('validation.appointment_type_required'),
            'client_id.required' => __('validation.client_id_required'),
            'client_id.exists' => __('validation.client_id_exists'),

            'pet_id.required' => __('validation.pet_id_required'),
            'pet_id.exists' => __('validation.pet_id_exists'),

            'appointment_date.required' => __('validation.appointment_date_required'),
            'appointment_date.date' => __('validation.appointment_date_date'),

            'start_time.required' => __('validation.start_time_required'),
            'start_time.date_format' => __('validation.start_time_date_format'),

            'is_video_conseil.boolean' => __('validation.is_video_conseil_boolean'),

            'reason_for_visit.string' => __('validation.reason_for_visit_string'),
            'appointment_notes.string' => __('validation.appointment_notes_string'),
        ];
    }
}
