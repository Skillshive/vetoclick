<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('allergies', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('pet_id')->constrained('pets')->onDelete('cascade');
            $table->foreignId('consultation_id')->nullable()->constrained('consultations')->onDelete('cascade');
            $table->foreignId('veterinarian_id')->constrained('veterinarians')->onDelete('cascade');
            $table->string('allergen_type'); // Food, Environmental, Medication
            $table->text('allergen_detail')->nullable(); 
            $table->date('start_date')->nullable();
            $table->text('reaction_description')->nullable();
            $table->enum('severity_level', ['Mild','Moderate','Severe','Life-threatening'])->nullable();
            $table->boolean('resolved_status')->default(false);
            $table->date('resolution_date')->nullable();
            $table->text('treatment_given')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void {
        Schema::dropIfExists('allergies');
    }
};
