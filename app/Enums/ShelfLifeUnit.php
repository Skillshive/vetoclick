<?php

namespace App\Enums;

enum ShelfLifeUnit: int
{
    case DAYS = 1;
    case MONTHS = 2;
    case YEARS = 3;

    public function text(): string
    {
        return match ($this) {
            self::DAYS => 'days',
            self::MONTHS => 'months',
            self::YEARS => 'years',
        };
    }

    public static function toArray(): array
    {
        return [
            self::DAYS->value => self::DAYS->text(),
            self::MONTHS->value => self::MONTHS->text(),
            self::YEARS->value => self::YEARS->text(),
        ];
    }
}
