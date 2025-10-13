<?php

use App\Enums\AvailabilityStatus;
use App\Enums\ProductType;
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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('name');
            $table->string('brand')->nullable();
            $table->text('description')->nullable();
            $table->string('sku')->unique();
            $table->string('barcode')->unique()->nullable();
            $table->foreignId('category_product_id')->constrained('category_products')->onDelete('set null');
            $table->foreignId('image_id')->nullable()->constrained('images')->onDelete('set null');

            $table->integer('type')->default(ProductType::MEDICATION->value);
            
            $table->string('dosage_form')->nullable(); // tablet, injection, oral solution, etc.
            $table->json( 'target_species')->nullable(); // ["dogs", "cats", "horses", "cattle"]
            $table->string('administration_route')->nullable(); // oral, topical, injection, etc.
            
            $table->boolean('prescription_required')->default(false);
            
            $table->integer('minimum_stock_level')->default(0);
            $table->integer('maximum_stock_level')->nullable();
            
            $table->boolean('is_active')->default(true);
            $table->integer('availability_status')->default(AvailabilityStatus::IN_STOCK->value);
            $table->string('manufacturer')->nullable();
            $table->string('batch_number')->nullable();
            $table->date('expiry_date')->nullable();
            $table->decimal('dosage_ml', 8, 2)->nullable();
            $table->text('vaccine_instructions')->nullable();
            $table->text('notes')->nullable();
                        
            $table->timestamps();
            $table->softDeletes(); 
            
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
