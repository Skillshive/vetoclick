<?php

use App\Http\Controllers\AppointmentController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\PetController;
use App\Http\Controllers\SubscriptionPlanController;
use App\Http\Controllers\BlogController;
use App\Http\Controllers\EmailController;
use App\Http\Controllers\ProductController;

Route::prefix('email')->controller(EmailController::class)->group(function () {
    Route::post('/send', 'sendEmail');
    Route::post('/send-template', 'sendTemplateEmail');
    Route::post('/send-bulk', 'sendBulkEmails');
});

Route::get('/subscription-plans/active', [SubscriptionPlanController::class, 'activePlans']);

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

Route::prefix('blogs')->controller(BlogController::class)->group(function () {
    Route::get('/', 'apiIndex');
});

Route::prefix('appointments')->controller(AppointmentController::class)->group(function () {
    Route::post('/', 'store');
    Route::post('/{uuid}/update', 'update');
});

Route::get('/clients', [ClientController::class, 'getAll'])->name('clients.all');
Route::get('/clients/{uuid}/pets', [PetController::class, 'getByClient'])->name('clients.pets');
