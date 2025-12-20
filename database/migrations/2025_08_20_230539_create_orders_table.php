<?php

use App\Enums\OrderStatus;
use App\Enums\OrderType;
use App\Enums\PaymentMethod;
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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('reference')->unique(); 
            
            $table->foreignId('supplier_id')->constrained('suppliers')->onDelete('cascade');
            $table->integer('order_type')->default(OrderType::REGULAR->value);
            $table->integer('status')->default(OrderStatus::DRAFT->value);
                        
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('tax_amount', 10, 2)->default(0);
            $table->decimal('shipping_cost', 10, 2)->default(0);
            $table->decimal('discount_amount', 10, 2)->default(0);
            $table->decimal('total_amount', 12, 2);
            
            $table->decimal('discount_percentage', 5, 2)->nullable();
            $table->date('payment_due_date')->nullable();
            $table->integer('payment_method')->default(PaymentMethod::CASH->value);
        
            $table->date('order_date');
            $table->date('confirmed_delivery_date')->nullable();
            
            $table->foreignId('requested_by')->constrained('users')->onDelete('cascade');
            $table->boolean('approved')->default(false); 
            $table->datetime('approved_at')->nullable();
            
            $table->datetime('received_at')->nullable();
            $table->foreignId('received_by')
            ->nullable()
            ->constrained('users')
            ->onDelete('cascade');
                    $table->text('receiving_notes')->nullable();
            
            
            $table->text('cancellation_reason')->nullable();
            $table->foreignId('cancelled_by')
            ->nullable()
            ->constrained('users')
            ->onDelete('cascade');
            $table->datetime('cancelled_at')->nullable();
            $table->text('return_reason')->nullable();
            $table->datetime('returned_at')->nullable();
        
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
