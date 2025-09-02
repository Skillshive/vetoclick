<?php

namespace App\Rules;

class Rules
{
    /***
     * validation rules for image files.
     * @return string[]
     */
    final static public function ImageValidationRules()
    {
        return ['image', new ImageExtensionRule(), 'max:2048'];
        }

    final static public function FileValidationRules()
    {
        return ['file', new FileExtensionRule(), 'max:5120']; 
    }
}
