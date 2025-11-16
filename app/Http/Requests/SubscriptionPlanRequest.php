<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SubscriptionPlanRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // You can add authorization logic here
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $planId = $this->route('subscription_plan')?->id;
        $isToggleRequest = $this->has('is_active') && count($this->all()) === 1;
        $isCreateRequest = !$planId; // This is a create request if no plan ID

        return [
            'name_en' => array_merge(
                $isToggleRequest ? ['nullable', 'string', 'max:255'] : ['required', 'string', 'max:255'],
                [
                    function ($attribute, $value, $fail) use ($isCreateRequest) {
                        if ($isCreateRequest) {
                            $activeCount = \App\Models\SubscriptionPlan::where('is_active', true)->count();
                            if ($activeCount >= 3) {
                                $fail('Cannot create new subscription plan. Maximum of 3 active subscription plans allowed.');
                            }
                        }
                    }
                ]
            ),
            'name_ar' => $isToggleRequest ? ['nullable', 'string', 'max:255'] : ['required', 'string', 'max:255'],
            'name_fr' => $isToggleRequest ? ['nullable', 'string', 'max:255'] : ['required', 'string', 'max:255'],

            'description_en' => $isToggleRequest ? ['nullable', 'string', 'max:1000'] : ['required', 'string', 'max:1000'],
            'description_ar' => $isToggleRequest ? ['nullable', 'string', 'max:1000'] : ['required', 'string', 'max:1000'],
            'description_fr' => $isToggleRequest ? ['nullable', 'string', 'max:1000'] : ['required', 'string', 'max:1000'],

            'selected_features' => 'array',
            'selected_features.*' => 'string|exists:features,uuid',

            'price' => 'required|numeric|min:0.01',
            'yearly_price' => 'nullable|numeric|min:0|gt:price',
            'max_clients' => 'nullable|integer|min:1',
            'max_pets' => 'nullable|integer|min:1',
            'max_appointments' => 'nullable|integer|min:1',

            'is_active' => [
                'boolean',
                function ($attribute, $value, $fail) use ($planId, $isCreateRequest) {
                    if ($value) {
                        $activeCount = \App\Models\SubscriptionPlan::where('is_active', true)
                            ->when($planId, function ($query) use ($planId) {
                                return $query->where('id', '!=', $planId);
                            })
                            ->count();

                        if ($activeCount >= 3) {
                            $fail('Maximum of 3 active subscription plans allowed.');
                        }
                    }
                },
            ],
            'is_popular' => 'boolean',
            'sort_order' => 'required|integer|min:0',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name_en.required' => 'English name is required.',
            'name_ar.required' => 'Arabic name is required.',
            'name_fr.required' => 'French name is required.',
            'name_en.max' => 'English name may not be greater than :max characters.',
            'name_ar.max' => 'Arabic name may not be greater than :max characters.',
            'name_fr.max' => 'French name may not be greater than :max characters.',

            'description_en.required' => 'English description is required.',
            'description_ar.required' => 'Arabic description is required.',
            'description_fr.required' => 'French description is required.',
            'description_en.max' => 'English description may not be greater than :max characters.',
            'description_ar.max' => 'Arabic description may not be greater than :max characters.',
            'description_fr.max' => 'French description may not be greater than :max characters.',


            'selected_features.*.exists' => 'One or more selected features do not exist.',

            'price.required' => 'Price is required.',
            'price.numeric' => 'Price must be a number.',
            'price.min' => 'Price must be at least :min.',

            'yearly_price.numeric' => 'Yearly price must be a number.',
            'yearly_price.min' => 'Yearly price must be at least :min.',
            'yearly_price.gt' => 'Yearly price must be greater than the monthly price.',

            'max_clients.integer' => 'Max clients must be an integer.',
            'max_clients.min' => 'Max clients must be at least :min.',

            'max_pets.integer' => 'Max pets must be an integer.',
            'max_pets.min' => 'Max pets must be at least :min.',

            'max_appointments.integer' => 'Max appointments must be an integer.',
            'max_appointments.min' => 'Max appointments must be at least :min.',

            'is_active.boolean' => 'Active status must be true or false.',
            'is_popular.boolean' => 'Popular status must be true or false.',

            'sort_order.required' => 'Sort order is required.',
            'sort_order.integer' => 'Sort order must be an integer.',
            'sort_order.min' => 'Sort order must be at least :min.',
        ];
    }
}
