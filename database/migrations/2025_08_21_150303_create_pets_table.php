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
    Schema::create('pets', function (Blueprint $table) {
    $table->id();
    $table->foreignId('client_id')->constrained('clients')->onDelete('cascade');
    $table->string('name');
    $table->string('species');
    $table->foreignId('breed_id')->nullable()->constrained('breeds');
    $table->enum('sex', ['Male', 'Female']);
    $table->boolean('neutered_status')->default(false);
    $table->date('dob')->nullable();
    $table->string('microchip_ref')->nullable();
    $table->string('profile_img')->nullable();
    $table->decimal('weight_kg', 5, 2)->nullable();
    $table->tinyInteger('bcs')->nullable(); // Body Condition Score
    $table->string('color')->nullable();
    $table->text('notes')->nullable();
    $table->date('deceased_at')->nullable();
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pets');
    }
};
