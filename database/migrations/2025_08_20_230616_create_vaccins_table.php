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
    Schema::create('vaccines', function (Blueprint $table) {
    $table->id();
    $table->unsignedBigInteger('pet_id');
    $table->string('vaccine_name');
    $table->date('date_administered');
    $table->date('next_due_date')->nullable();
    $table->timestamps();

    $table->foreign('pet_id')->references('id')->on('pets')->onDelete('cascade');
});

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vaccins');
    }
};
