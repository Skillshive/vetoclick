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
       Schema::create('veterinarians', function (Blueprint $table) {
    $table->id();
    $table->string('license_number')->unique();
    $table->string('first_name');
    $table->string('last_name');
    $table->string('email')->unique();
    $table->string('password_hash');
    $table->string('phone')->nullable();
    $table->string('specialization')->nullable();
    $table->integer('years_experience')->nullable();
    $table->string('profile_img')->nullable();
    $table->foreignId('subscription_plan_id')->nullable()->constrained('subscription_plans');
    $table->enum('subscription_status', ['active', 'inactive', 'suspended'])->default('inactive');
    $table->date('subscription_start_date')->nullable();
    $table->date('subscription_end_date')->nullable();
    $table->timestamps();
});


    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('veterinaries');
    }
};
