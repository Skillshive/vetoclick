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
       Schema::create('appointments', function (Blueprint $table) {
    $table->id();
    $table->foreignId('veterinarian_id')->constrained('veterinarians')->onDelete('cascade');
    $table->foreignId('client_id')->constrained('clients')->onDelete('cascade');
    $table->foreignId('pet_id')->constrained('pets')->onDelete('cascade');
    $table->string('appointment_type');
    $table->date('appointment_date');
    $table->time('start_time');
    $table->time('end_time');
    $table->integer('duration_minutes');
    $table->enum('status', ['scheduled', 'confirmed', 'cancelled', 'no_show', 'completed'])->default('scheduled');
    $table->boolean('is_video_conseil')->default(false);
    $table->string('video_meeting_id')->nullable();
    $table->string('video_join_url')->nullable();
    $table->string('reason_for_visit')->nullable();
    $table->text('appointment_notes')->nullable();
    $table->timestamps();
});

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
