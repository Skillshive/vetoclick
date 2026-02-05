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
        Schema::table('blogs', function (Blueprint $table) {
            $table->boolean('is_published')->default(false)->after('tags');
            $table->boolean('is_featured')->default(false)->after('is_published');
            $table->dateTime('publish_date')->nullable()->after('is_featured');
            $table->integer('reading_time')->nullable()->after('publish_date');
            $table->foreignId('author_id')->nullable()->after('reading_time')->constrained('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('blogs', function (Blueprint $table) {
            $table->dropForeign(['author_id']);
            $table->dropColumn(['is_published', 'is_featured', 'publish_date', 'reading_time', 'author_id']);
        });
    }
};
