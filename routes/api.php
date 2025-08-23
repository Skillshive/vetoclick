<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EmailController;

// Email Service API Routes
Route::prefix('email')->controller(EmailController::class)->group(function () {
    Route::post('/send', 'sendEmail');
    Route::post('/send-template', 'sendTemplateEmail');
    Route::post('/send-bulk', 'sendBulkEmails');
});
