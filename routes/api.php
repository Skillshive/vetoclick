<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EmailController;
use App\Http\Controllers\SubscriptionPlanController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\BlogController;

// Email Service API Routes
Route::prefix('email')->controller(EmailController::class)->group(function () {
    Route::post('/send', 'sendEmail');
    Route::post('/send-template', 'sendTemplateEmail');
    Route::post('/send-bulk', 'sendBulkEmails');
});

// Subscription Plans API Routes
Route::get('/subscription-plans/active', [SubscriptionPlanController::class, 'activePlans']);

// Product API Routes
Route::prefix('products')->controller(ProductController::class)->group(function () {
    Route::get('/', 'apiIndex');
    Route::get('/search', 'search');
    Route::get('/all', 'getAllAsCollection');
    Route::get('/{uuid}', 'apiShow');
    Route::post('/', 'store');
    Route::put('/{uuid}', 'update');
    Route::delete('/{uuid}', 'destroy');
    Route::get('/export/csv', 'export');
});

// Blog API Routes
Route::prefix('blogs')->controller(BlogController::class)->group(function () {
    Route::get('/', 'apiIndex');
});


// Address validation is now handled by web routes
