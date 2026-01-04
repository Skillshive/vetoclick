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
            $table->text('video_recording_url')->nullable()->after('video_join_url');
            $table->boolean('client_attended_meeting')->default(false)->after('video_recording_url');
            $table->timestamp('client_joined_at')->nullable()->after('client_attended_meeting');
            $table->timestamp('meeting_started_at')->nullable()->after('client_joined_at');
            $table->timestamp('meeting_ended_at')->nullable()->after('meeting_started_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropColumn([
                'video_recording_url',
                'client_attended_meeting',
                'client_joined_at',
                'meeting_started_at',
                'meeting_ended_at'
            ]);
        });
    }
};
