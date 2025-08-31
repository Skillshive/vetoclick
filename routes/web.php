<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\LanguageController;
use App\Http\Controllers\ProductCategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\SpeciesController;
use App\Http\Controllers\SupplierController;

// Language routes
Route::get('/language/switch/{locale}', [LanguageController::class, 'switch'])->name('language.switch');
Route::get('/api/languages', [LanguageController::class, 'getLanguages'])->name('language.get');


Route::redirect('/', '/dashboard');

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

// Species routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('species', SpeciesController::class);
});

// Supplier routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('suppliers', SupplierController::class);
});

// Product Category routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('product-categories', ProductCategoryController::class);
});

// Product routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('products', ProductController::class);
});

require __DIR__.'/auth.php';
