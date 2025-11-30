<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('veterinarians', function (Blueprint $table) {
            $table->uuid('uuid')->nullable()->after('id');
        });

        // Generate UUIDs for existing records
        $veterinaries = \App\Models\Veterinary::whereNull('uuid')->get();
        foreach ($veterinaries as $veterinary) {
            $veterinary->uuid = \Illuminate\Support\Str::uuid();
            $veterinary->save();
        }

        // Make uuid unique and not nullable
        Schema::table('veterinarians', function (Blueprint $table) {
            $table->uuid('uuid')->unique()->nullable(false)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('veterinarians', function (Blueprint $table) {
            $table->dropColumn('uuid');
        });
    }
};
