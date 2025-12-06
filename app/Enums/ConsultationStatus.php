<?php

namespace App\Enums;

enum ConsultationStatus: int
{
    case COMPLETED = 1;
    case IN_PROGRESS = 2;
    case CANCELLED = 3;

    public function text()
    {
        return match ($this) {
            self::COMPLETED => 'completed',
            self::IN_PROGRESS => 'in_progress',
            self::CANCELLED => 'cancelled',
        };
    }

    public static function toArray()
    {
        return [
            self::COMPLETED->value => self::COMPLETED->text(),
            self::IN_PROGRESS->value => self::IN_PROGRESS->text(),
            self::CANCELLED->value => self::CANCELLED->text(),
        ];
    }

    /**
     * Get text value from numeric status
     */
    public static function getTextFromValue(int $value): string
    {
        return match ($value) {
            self::COMPLETED->value => self::COMPLETED->text(),
            self::IN_PROGRESS->value => self::IN_PROGRESS->text(),
            self::CANCELLED->value => self::CANCELLED->text(),
            default => 'unknown',
        };
    }
}