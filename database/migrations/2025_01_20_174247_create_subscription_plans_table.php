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
        Schema::create('subscription_plans', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->json('name'); // Multi-language: {"en": "Basic Plan", "ar": "الخطة الأساسية", "fr": "Plan de base"}
            $table->json('description'); // Multi-language description
            $table->decimal('price', 10, 2);
            $table->integer('max_clients')->nullable(); // Maximum clients allowed
            $table->integer('max_pets')->nullable(); // Maximum pets allowed
            $table->integer('max_appointments')->nullable(); // Maximum appointments per month
            $table->boolean('is_active')->default(true);
            $table->boolean('is_popular')->default(false); // Highlight popular plan
            $table->integer('sort_order')->default(0);
            $table->decimal('yearly_price', 10, 2)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscription_plans');
    }
};
