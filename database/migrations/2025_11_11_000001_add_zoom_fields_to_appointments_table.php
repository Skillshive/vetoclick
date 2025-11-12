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
        Schema::table('appointments', function (Blueprint $table) {
            $table->text('video_provider')->nullable()->after('is_video_conseil');
            $table->boolean('video_auto_record')->default(false)->after('video_provider');
            $table->text('video_start_url')->nullable()->after('video_join_url');
            $table->text('video_password')->nullable()->after('video_start_url');
            $table->text('video_recording_status')->nullable()->after('video_password');
            $table->text('video_recording_url')->nullable()->after('video_recording_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropColumn([
                'video_provider',
                'video_auto_record',
                'video_start_url',
                'video_password',
                'video_recording_status',
                'video_recording_url',
            ]);
        });
    }
};

