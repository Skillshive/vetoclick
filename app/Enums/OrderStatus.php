<?php

namespace App\Enums;

enum OrderStatus: int
{
    case DRAFT = 1;
    case PENDING = 2;
    case CONFIRMED = 3;
    case SHIPPED = 5;
    case RECEIVED = 7;
    case CANCELLED = 9;
    case RETURNED = 10;

    public function text()
    {
        return match ($this) {
            self::DRAFT => 'draft',
            self::PENDING => 'pending',
            self::CONFIRMED => 'confirmed',
            self::SHIPPED => 'shipped',
            self::RECEIVED => 'received',
            self::CANCELLED => 'cancelled',
            self::RETURNED => 'returned',
        };
    }

    public static function toArray()
    {
        return [
            self::DRAFT->value => self::DRAFT->text(),
            self::PENDING->value => self::PENDING->text(),
            self::CONFIRMED->value => self::CONFIRMED->text(),
            self::SHIPPED->value => self::SHIPPED->text(),
            self::RECEIVED->value => self::RECEIVED->text(),
            self::CANCELLED->value => self::CANCELLED->text(),
            self::RETURNED->value => self::RETURNED->text(),
        ];
    }

    public function class() 
    {
        return match ($this) {
            self::DRAFT => 'secondary',
            self::PENDING => 'warning',
            self::CONFIRMED => 'info',
            self::SHIPPED => 'primary',
            self::RECEIVED => 'success',
            self::CANCELLED => 'danger',
            self::RETURNED => 'secondary',
        };
    }

    public function canBeModified()
    {
        return match ($this) {
            self::DRAFT => true,
            self::PENDING => true,     
            self::CONFIRMED => false,  
            self::SHIPPED => false,
            self::RECEIVED => false,
            self::CANCELLED => false,
            self::RETURNED => false,
        };
    }

    public function canBeCancelled()
    {
        return match ($this) {
            self::DRAFT => true,
            self::PENDING => true,
            self::CONFIRMED => true,    
            self::SHIPPED => false,
            self::RECEIVED => false,
            self::CANCELLED => false,
            self::RETURNED => false,
        };
    }

    public function canBeReceived()
    {
        return match ($this) {
            self::DRAFT => false,
            self::PENDING => false,
            self::CONFIRMED => true,
            self::SHIPPED => true,
            self::RECEIVED => false,
            self::CANCELLED => false,
            self::RETURNED => false,
        };
    }
}