<?php

namespace App\Enums;

enum OrderType: int
{
    case REGULAR = 1;
    case EMERGENCY = 2;

    public function text()
    {
        return match ($this) {
            self::REGULAR =>  'regular',
            self::EMERGENCY =>'emergency',
        };
    }

    public static function toArray()
    {
        return [
            self::REGULAR->value => self::REGULAR->text(),
            self::EMERGENCY->value => self::EMERGENCY->text()
        ];
    }
}