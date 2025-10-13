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
        Schema::create('vaccination_schedules', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('name'); // e.g., "Puppy Core Vaccines", "Annual Booster"
            $table->text('description')->nullable();
            $table->json('target_species'); // ["dogs", "cats", "horses"]
            $table->integer('age_weeks_min')->nullable(); // Minimum age in weeks
            $table->integer('age_weeks_max')->nullable(); // Maximum age in weeks
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vaccination_schedules');
    }
};
