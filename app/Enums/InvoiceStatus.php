<?php

namespace App\Enums;

enum InvoiceStatus: int
{
    case PENDING = 2;
    case RECEIVED = 3;
    case UNDER_REVIEW = 4;
    case APPROVED = 5;
    case REJECTED = 6;
    case PAID = 7;
    case PARTIALLY_PAID = 8;
    case CANCELLED = 9;

    public function text()
    {
        return match ($this) {
            self::PENDING => 'pending',
            self::RECEIVED => 'received',
            self::UNDER_REVIEW => 'under_review',
            self::APPROVED => 'approved',
            self::REJECTED => 'rejected',
            self::PAID => 'paid',
            self::PARTIALLY_PAID => 'partially_paid',
            self::CANCELLED => 'cancelled',
        };
    }

    public static function toArray()
    {
        return [
            self::PENDING->value => self::PENDING->text(),
            self::RECEIVED->value => self::RECEIVED->text(),
            self::UNDER_REVIEW->value => self::UNDER_REVIEW->text(),
            self::APPROVED->value => self::APPROVED->text(),
            self::REJECTED->value => self::REJECTED->text(),
            self::PAID->value => self::PAID->text(),
            self::PARTIALLY_PAID->value => self::PARTIALLY_PAID->text(),
            self::CANCELLED->value => self::CANCELLED->text(),
        ];
    }
}