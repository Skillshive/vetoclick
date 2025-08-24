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
    Schema::create('clients_vets', function (Blueprint $table) {
    $table->id();
    $table->uuid('uuid')->unique();
    $table->foreignId('client_id')->constrained('clients')->onDelete('cascade');
    $table->foreignId('vet_id')->constrained('veterinarians')->onDelete('cascade');
    $table->timestamps();
    $table->softDeletes();
    $table->unique(['client_id', 'vet_id']);
});
    }

   
 public function down(): void
    {
        Schema::dropIfExists('clients_vets');
    }
    
};
