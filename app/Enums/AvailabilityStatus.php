<?php

namespace App\Enums;

enum AvailabilityStatus: int
{
    case IN_STOCK = 1;
    case LOW_STOCK = 2;
    case OUT_OF_STOCK = 3;

    public function text()
    {
        return match ($this) {
            self::IN_STOCK => 'in_stock',
            self::LOW_STOCK => 'low_stock',
            self::OUT_OF_STOCK => 'out_of_stock',
        };
    }

    public static function toArray()
    {
        return [
            self::IN_STOCK->value => self::IN_STOCK->text(),
            self::LOW_STOCK->value => self::LOW_STOCK->text(),
            self::OUT_OF_STOCK->value => self::OUT_OF_STOCK->text()
        ];
    }

    public function class()
    {
        return match ($this) {
            self::IN_STOCK => 'success',
            self::LOW_STOCK => 'warning',
            self::OUT_OF_STOCK => 'danger',
        };
    }
}