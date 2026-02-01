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
            $table->boolean('accepts_video_calls')->default(false)->after('consultation_price');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('veterinarians', function (Blueprint $table) {
            $table->dropColumn('accepts_video_calls');
        });
    }
};
