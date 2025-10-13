<?php

namespace App\Enums;

enum ProductType: int
{
    case MEDICATION = 1;
    case VACCINE = 2;
    case SUPPLEMENT = 3;
    case EQUIPMENT = 4;

    public function text()
    {
        return match ($this) {
            self::MEDICATION => 'medication',
            self::VACCINE => 'vaccine',
            self::SUPPLEMENT => 'supplement',
            self::EQUIPMENT => 'equipment',
        };
    }

    public static function toArray()
    {
        return [
            self::MEDICATION->value => self::MEDICATION->text(),
            self::VACCINE->value => self::VACCINE->text(),
            self::SUPPLEMENT->value => self::SUPPLEMENT->text(),
            self::EQUIPMENT->value => self::EQUIPMENT->text(),
        ];
    }

    public function requiresPrescription()
    {
        return match ($this) {
            self::MEDICATION => true,
            self::VACCINE => true,
            self::SUPPLEMENT => false,
            self::EQUIPMENT => false,
        };
    }
}