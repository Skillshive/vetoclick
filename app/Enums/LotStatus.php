<?php

namespace App\Enums;

enum LotStatus: int
{
    case ACTIVE = 1;
    case EXPIRED = 2;
    case COMPLETED = 3;
    case RETURNED = 4;

    public function text()
    {
        return match ($this) {
            self::ACTIVE => 'active',
            self::EXPIRED => 'expired',
            self::COMPLETED => 'completed',
            self::RETURNED => 'returned',
        };
    }

    public static function toArray()
    {
        return [
            self::ACTIVE->value => self::ACTIVE->text(),
            self::EXPIRED->value => self::EXPIRED->text(),
            self::COMPLETED->value => self::COMPLETED->text(),
            self::RETURNED->value => self::RETURNED->text(),
        ];
    }
}