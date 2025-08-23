<?php

namespace App\common;

use App\Interfaces\ServiceInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;

class Service implements ServiceInterface
{
    /**
     * Check if the specified column value is unique among other models except the current one.
     *
     * @param Model $model
     * @param string $attr
     * @param string $value
     * @return bool
     */
    public static function isColumnValueUniqueExceptSelf(Model $model, string $attr, string $value): bool
    {
        return $model->newQuery()
            ->where('id', '!=', $model->id)
            ->where($attr, $value)
            ->doesntExist();
    }

    /**
     * Log an informational message.
     *
     * @param string $message
     */
    public static function logInfo(string $message): void
    {
        Log::info($message);
    }

    /**
     * Log an error message.
     *
     * @param string $message
     */
    public static function logError(string $message): void
    {
        Log::error($message);
    }

    /**
     * Validate if an email is in a valid format.
     *
     * @param string $email
     * @return bool
     */
    public static function isValidEmail(string $email): bool
    {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }

    /**
     * Generate a random string of a specified length.
     *
     * @param int $length
     * @return string
     */
    public static function generateRandomString(int $length = 10): string
    {
        $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        return substr(str_shuffle(str_repeat($characters, ceil($length / strlen($characters)))), 1, $length);
    }
}