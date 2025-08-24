<?php

namespace App\Enums;

enum PaymentMethod: int
{
    case BANK_TRANSFER = 1;
    case CHECK = 2;
    case CASH = 3;
    case TRANSFER = 4;

    public function text()
    {
        return match ($this) {
            self::BANK_TRANSFER => 'bank_transfer',
            self::CHECK => 'check',
            self::CASH => 'cash',
            self::TRANSFER => 'transfer',
        };
    }

    public static function toArray()
    {
        return [
            self::BANK_TRANSFER->value => self::BANK_TRANSFER->text(),
            self::CHECK->value => self::CHECK->text(),
            self::CASH->value => self::CASH->text(),
            self::TRANSFER->value => self::TRANSFER->text(),
        ];
    }

    public function class()
    {
        return match ($this) {
            self::BANK_TRANSFER => 'primary',
            self::CHECK => 'secondary',
            self::CASH => 'warning',
            self::TRANSFER => 'primary',
        };
    }

    public function isImmediate()
    {
        return match ($this) {
            self::BANK_TRANSFER => false,   
            self::CHECK => false,            
            self::CASH => true,              
            self::TRANSFER => false,          
        };
    }
}