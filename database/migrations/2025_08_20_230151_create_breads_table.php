<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class () extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {Schema::create('breads', function (Blueprint $table) {
    $table->id();
    $table->string('species');
    $table->string('breed_name');
    $table->decimal('avg_weight_kg', 5, 2)->nullable();
    $table->integer('life_span_years')->nullable();
    $table->text('common_health_issues')->nullable();
    $table->timestamps();
});

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('breads');
    }
};
