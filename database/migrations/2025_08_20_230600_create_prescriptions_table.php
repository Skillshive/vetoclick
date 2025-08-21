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
    Schema::create('prescriptions', function (Blueprint $table) {
    $table->id();
    $table->unsignedBigInteger('medical_record_id');
    $table->string('medication_name');
    $table->string('dosage');
    $table->string('duration');
    $table->timestamps();

    $table->foreign('medical_record_id')->references('id')->on('medical_records')->onDelete('cascade');
});

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prescriptions');
    }
};
