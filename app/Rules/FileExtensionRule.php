<?php

namespace App\Rules;

use App\Services\FileService;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class FileExtensionRule implements ValidationRule
{
    /**
     * Run the validation rule.
     *
     * @param \Closure(string): \Illuminate\Translation\PotentiallyTranslatedString $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {

        $extension = strtolower($value->getClientOriginalExtension());
        if (!FileService::isExtensionSupported($extension)) {
            $fail(__('validation.file_extension', ['attribute' => $attribute, 'supported_extensions' => implode(',',  FileService::getExtensionSupported())]));
        }
    }
}
