<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EmailController;
use App\Http\Controllers\SubscriptionPlanController;

// Email Service API Routes
Route::prefix('email')->controller(EmailController::class)->group(function () {
    Route::post('/send', 'sendEmail');
    Route::post('/send-template', 'sendTemplateEmail');
    Route::post('/send-bulk', 'sendBulkEmails');
});

// Subscription Plans API Routes
Route::get('/subscription-plans/active', [SubscriptionPlanController::class, 'activePlans']);
