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
       Schema::create('consultations', function (Blueprint $table) {
    $table->id();
    $table->foreignId('appointment_id')->constrained('appointments')->onDelete('cascade');
    $table->foreignId('veterinarian_id')->constrained('veterinarians')->onDelete('cascade');
    $table->foreignId('client_id')->constrained('clients')->onDelete('cascade');
    $table->foreignId('pet_id')->constrained('pets')->onDelete('cascade');
    $table->date('conseil_date');
    $table->time('start_time');
    $table->time('end_time');
    $table->text('conseil_notes')->nullable();
    $table->boolean('follow_up_required')->default(false);
    $table->date('follow_up_date')->nullable();
    $table->decimal('conseil_fee', 8, 2)->nullable();
    $table->enum('status', ['completed', 'in_progress', 'cancelled'])->default('in_progress');
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('consultations');
    }
};
