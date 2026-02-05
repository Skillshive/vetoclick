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
        Schema::table('category_blogs', function (Blueprint $table) {
            $table->unsignedBigInteger('vet_id')->nullable()->after('parent_category_id');
            $table->foreign('vet_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('category_blogs', function (Blueprint $table) {
            $table->dropForeign(['vet_id']);
            $table->dropColumn('vet_id');
        });
    }
};
