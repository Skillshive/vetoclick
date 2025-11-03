<?php

namespace App\Traits;

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;

trait HandlesMySqlKeyLength
{
    /**
     * Create a string column with appropriate length for MySQL unique constraints
     */
    protected function stringForUnique(Blueprint $table, string $column, int $length = 125): void
    {
        $table->string($column, $length);
    }

    /**
     * Create a unique constraint that respects MySQL key length limits
     */
    protected function uniqueConstraint(Blueprint $table, array $columns, string $name = null): void
    {
        // Calculate total key length
        $totalLength = 0;
        foreach ($columns as $column) {
            $totalLength += 125; // Use 125 as default for unique constraints
        }

        // If total length exceeds 1000 bytes (250 chars), use shorter lengths
        if ($totalLength > 250) {
            $maxLength = floor(250 / count($columns));
            foreach ($columns as $column) {
                $table->string($column, min($maxLength, 125));
            }
        }

        $table->unique($columns, $name);
    }

    /**
     * Check if we're using MySQL and adjust accordingly
     */
    protected function isMySql(): bool
    {
        return DB::getDriverName() === 'mysql';
    }
}

