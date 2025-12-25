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
        // We need to drop and recreate the table because the ID column type needs to change
        // Save existing data first (only if table exists)
        $existingNotifications = [];
        if (Schema::hasTable('notifications')) {
            try {
                $existingNotifications = \DB::table('notifications')->get();
            } catch (\Exception $e) {
                // Table exists but might be corrupted, continue anyway
                $existingNotifications = [];
            }
        }
        
        // Drop the existing notifications table
        Schema::dropIfExists('notifications');
        
        // Recreate with proper structure for Laravel notifications
        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('type');
            $table->morphs('notifiable'); // This automatically creates an index
            $table->text('data');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });
        
        // Restore existing notifications if any (though they probably won't work with new structure)
        // This is just to prevent data loss
        foreach ($existingNotifications as $notification) {
            try {
                \DB::table('notifications')->insert([
                    'id' => \Illuminate\Support\Str::uuid(),
                    'type' => $notification->type ?? 'App\Notifications\Generic',
                    'notifiable_type' => $notification->notifiable_type ?? 'App\Models\User',
                    'notifiable_id' => $notification->notifiable_id ?? 0,
                    'data' => $notification->data ?? '{}',
                    'read_at' => $notification->read_at ?? null,
                    'created_at' => $notification->created_at ?? now(),
                    'updated_at' => $notification->updated_at ?? now(),
                ]);
            } catch (\Exception $e) {
                // Skip if there's an error with old data
                \Log::warning('Could not migrate old notification: ' . $e->getMessage());
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Note: This will drop all notifications
        Schema::dropIfExists('notifications');
    }
};
