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
        Schema::create('vaccine_schedule_products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vaccination_schedule_id')->constrained('vaccination_schedules')->onDelete('cascade');
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->integer('sequence_order')->default(1); // Order in the schedule
            $table->integer('age_weeks')->nullable(); // Specific age for this vaccine
            $table->integer('interval_weeks')->nullable(); // Weeks between doses
            $table->boolean('is_required')->default(true);
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->unique(['vaccination_schedule_id', 'product_id', 'sequence_order'], 'vsp_schedule_product_sequence_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vaccine_schedule_products');
    }
};
