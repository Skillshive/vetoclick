<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class () extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {Schema::create('breeds', function (Blueprint $table) {
    $table->id();
    $table->uuid('uuid')->unique();
    $table->foreignId('species_id')->constrained('species')->onDelete('cascade');
    $table->string('breed_name');
    $table->decimal('avg_weight_kg', 5, 2)->nullable();
    $table->integer('life_span_years')->nullable();
    $table->text('common_health_issues')->nullable();
    $table->timestamps();
    $table->softDeletes(); 
});

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('breeds');
    }
};
