<?php

namespace App\Rules;

use App\Services\AddressValidationService;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class ValidAddress implements ValidationRule
{
    protected AddressValidationService $addressValidationService;

    public function __construct()
    {
        $this->addressValidationService = app(AddressValidationService::class);
    }

    /**
     * Run the validation rule.
     *
     * @param  \Closure(string, ?string=): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        // Skip validation if address is empty (handled by required rule)
        if (empty($value)) {
            return;
        }

        // Skip validation if service is not available
        if (!$this->addressValidationService->isAvailable()) {
            return;
        }

        $result = $this->addressValidationService->validateAddress($value);

        if (!$result['valid']) {
            $fail($result['message']);
        }
    }
}
