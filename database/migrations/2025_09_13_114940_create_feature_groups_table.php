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
        Schema::create('feature_groups', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('slug')->unique();
            $table->json('name'); // Multi-language: {"en": "Basic Features", "ar": "الميزات الأساسية", "fr": "Fonctionnalités de base"}
            $table->json('description'); // Multi-language description
            $table->string('icon')->nullable(); // Icon class or name
            $table->string('color')->default('primary'); // Color theme
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('feature_groups');
    }
};
