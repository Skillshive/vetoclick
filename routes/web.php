<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

// Species routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('species', \App\Http\Controllers\SpeciesController::class);
});

// Supplier routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('suppliers', \App\Http\Controllers\SupplierController::class);
});

// Product Category routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('product-categories', \App\Http\Controllers\ProductCategoryController::class);
});

// Product routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('products', \App\Http\Controllers\ProductController::class);
});

require __DIR__.'/auth.php';
