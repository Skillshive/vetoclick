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
    
        Schema::create('availabilities', function (Blueprint $table) {
    $table->id();
    $table->uuid('uuid')->unique();
    $table->foreignId('veterinarian_id')->constrained('veterinarians')->onDelete('cascade');
    $table->tinyInteger('day_of_week'); // 0=Sunday
    $table->time('start_time');
    $table->time('end_time');
    $table->boolean('is_available')->default(true);
    $table->timestamps();
    $table->softDeletes();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('availabilities');
    }
};
