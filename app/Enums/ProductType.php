<?php

namespace App\Enums;

enum ProductType: int
{
    case MEDICATION = 1;
    case VACCINE = 2;
    case SUPPLEMENT = 3;
    case EQUIPMENT = 4;
    case ACCESSORY = 5;
    case DIAGNOSTIC = 6;
    case SURGICAL = 7;

    public function text()
    {
        return match ($this) {
            self::MEDICATION => 'medication',
            self::VACCINE => 'vaccine',
            self::SUPPLEMENT => 'supplement',
            self::EQUIPMENT => 'equipment',
            self::ACCESSORY => 'accessory',
            self::DIAGNOSTIC => 'diagnostic',
            self::SURGICAL => 'surgical',
        };
    }

    public static function toArray()
    {
        return [
            self::MEDICATION->value => self::MEDICATION->text(),
            self::VACCINE->value => self::VACCINE->text(),
            self::SUPPLEMENT->value => self::SUPPLEMENT->text(),
            self::EQUIPMENT->value => self::EQUIPMENT->text(),
            self::ACCESSORY->value => self::ACCESSORY->text(),
            self::DIAGNOSTIC->value => self::DIAGNOSTIC->text(),
            self::SURGICAL->value => self::SURGICAL->text(),
        ];
    }

    public function requiresPrescription()
    {
        return match ($this) {
            self::MEDICATION => true,
            self::VACCINE => true,
            self::SUPPLEMENT => false,
            self::EQUIPMENT => false,
            self::ACCESSORY => false,
            self::DIAGNOSTIC => false,
            self::SURGICAL => false,
        };
    }
}