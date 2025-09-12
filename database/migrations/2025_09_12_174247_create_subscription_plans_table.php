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
            $table->string('slug')->unique();
            $table->json('name'); // Multi-language: {"en": "Basic Plan", "ar": "الخطة الأساسية", "fr": "Plan de base"}
            $table->json('description'); // Multi-language description
            $table->json('features'); // Multi-language features array
            $table->decimal('price', 10, 2);
            $table->string('currency', 3)->default('USD');
            $table->string('billing_period')->default('monthly'); // monthly, yearly, lifetime
            $table->integer('trial_days')->nullable(); // Free trial period
            $table->integer('max_users')->nullable(); // Maximum users allowed
            $table->integer('max_pets')->nullable(); // Maximum pets allowed
            $table->integer('max_appointments')->nullable(); // Maximum appointments per month
            $table->boolean('is_active')->default(true);
            $table->boolean('is_popular')->default(false); // Highlight popular plan
            $table->integer('sort_order')->default(0);
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
