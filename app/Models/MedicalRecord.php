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
        Schema::create('medical_records', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('client_id');   // lien avec le client
            $table->unsignedBigInteger('vet_id');      // lien avec le vétérinaire
            $table->string('animal_name');             // nom de l’animal
            $table->string('species');                 // espèce (chien, chat…)
            $table->string('breed')->nullable();       // race
            $table->integer('age')->nullable();        // âge
            $table->text('symptoms')->nullable();      // symptômes
            $table->text('diagnosis')->nullable();     // diagnostic
            $table->text('treatment')->nullable();     // traitement
            $table->date('visit_date');                // date de la visite
            $table->timestamps();

            // Contraintes de clés étrangères
            $table->foreign('client_id')->references('id')->on('clients')->onDelete('cascade');
            $table->foreign('vet_id')->references('id')->on('vets')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('medical_records');
    }
};
