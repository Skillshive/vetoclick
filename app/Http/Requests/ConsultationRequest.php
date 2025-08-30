<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ConsultationRequest extends FormRequest
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
            'appointment_id' => 'required|exists:appointments,id',
            'veterinary_id' => 'required|exists:veterinaries,id',
            'pet_id' => 'required|exists:pets,id',
            'diagnosis' => 'required|string',
            'treatment_plan' => 'nullable|string',
            'prescription_details' => 'nullable|string',
            'follow_up_date' => 'nullable|date|after_or_equal:today',
            'weight' => 'nullable|numeric|min:0',
            'temperature' => 'nullable|numeric|min:0',
            'heart_rate' => 'nullable|string|max:50',
            'respiratory_rate' => 'nullable|string|max:50',
            'notes' => 'nullable|string',
            'status' => 'required|in:in_progress,completed,follow_up_needed',
        ];
    }
}
