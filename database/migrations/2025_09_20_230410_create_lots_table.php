<?php

use App\Enums\LotStatus;
use App\Enums\ShelfLifeUnit;
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
        Schema::create('lots', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->unsignedBigInteger('product_id');
            $table->unsignedBigInteger('order_id');
            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
            $table->foreign('order_id')->references('id')->on('orders')->onDelete('cascade');
            
            $table->string('reference')->unique(); 
            $table->date('expiry_date')->nullable();
            $table->integer('shelf_life_unit')->default(ShelfLifeUnit::DAYS->value);
            $table->string('shelf_life')->nullable();
              
            $table->integer('initial_quantity'); 
            $table->integer('current_quantity');             
            $table->decimal('selling_price', 10, 2)->nullable(); 
            $table->integer('status')->default(LotStatus::ACTIVE->value);
            $table->json('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lots');
    }
};
