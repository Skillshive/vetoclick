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
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $now = now()->format('Y-m-d H:i:s');
        
        return [
            'client_id' => 'required|exists:clients,id',
            'pet_id' => 'nullable|exists:pets,id',
            'veterinary_id' => 'required|exists:veterinaries,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'start_time' => [
                'required',
                'date',
                'after_or_equal:' . $now,
                function ($attribute, $value, $fail) {
                    $endTime = $this->input('end_time');
                    if (strtotime($value) >= strtotime($endTime)) {
                        $fail('The start time must be before the end time.');
                    }
                },
            ],
            'end_time' => [
                'required',
                'date',
                'after:start_time',
            ],
            'status' => 'required|in:scheduled,confirmed,completed,cancelled,no_show',
            'type' => 'nullable|string|max:100',
            'location' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'cancellation_reason' => 'nullable|required_if:status,cancelled|string|max:500',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation()
    {
        if ($this->status !== 'cancelled') {
            $this->merge(['cancellation_reason' => null]);
        }
    }
}
