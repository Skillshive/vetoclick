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
        Schema::create('blogs', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('title');
            $table->text('body');
            $table->string('caption');
            $table->foreignId('image_id')->nullable()->constrained('images')->onDelete('set null');
            $table->string('meta_title');
            $table->text('meta_desc');
            $table->string('meta_keywords');
            $table->foreignId('category_blog_id')->constrained('category_blogs')->onDelete('cascade');
            $table->text('tags');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('blogs');
    }
};