<?php

use App\Http\Controllers\AvailabilityController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\CategoryProductController;
use App\Http\Controllers\LanguageController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SpeciesController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\BreedController;
require_once 'common.php';

// Language routes
Route::get('/language/switch/{locale}', [LanguageController::class, 'switch'])->name('language.switch');
Route::get('/api/languages', [LanguageController::class, 'getLanguages'])->name('language.get');


Route::redirect('/', '/dashboard');

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

// Profile routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'show'])->name('profile.show');
    Route::post('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::post('/profile/password', [ProfileController::class, 'updatePassword'])->name('profile.password.update');
});

// Availability routes
Route::middleware(['auth', 'verified'])->prefix('availability')->controller(AvailabilityController::class)->group(function () {
    Route::post('/', 'store')->name('availability.store');
    Route::get('/current-week', 'getCurrentWeek')->name('availability.getCurrentWeek');
    Route::delete('/{uuid}', 'destroy')->name('availability.destroy');
    Route::post('/check', 'checkAvailability')->name('availability.check');
});

// Species routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::name('species.')->prefix('species')
        ->controller(SpeciesController::class)
        ->group(function () {
            Route::get('', 'index')
                ->name('index');
            Route::get('data', 'data')->name('data');
            Route::get('create', 'create')->name('create');
            Route::post('store', 'store')->name('store');
            Route::get('{species}/edit', 'edit')->name('edit');
            Route::post('delete', 'destroyGroup')->name('destroyGroup');
            Route::get('{species}/delete', 'destroy')->name('destroy');
            Route::get('{species}/show', 'show')->name('show');
            Route::post('{species}/update', 'update')->name('update');
        });
});

// Breed routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::name('breeds.')->prefix('breeds')
        ->controller(BreedController::class)
        ->group(function () {
            Route::get('', 'index')->name('index');
            Route::get('create', 'create')->name('create');
            Route::post('store', 'store')->name('store');
            Route::get('{breed}/edit', 'edit')->name('edit');
            Route::post('{breed}/update', 'update')->name('update');
            Route::delete('{breed}/delete', 'destroy')->name('destroy');
            // Get breeds for a specific species
            Route::get('species/{speciesUuid}', 'getBySpecies')->name('by-species');
        });
});

// Supplier routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('suppliers', SupplierController::class);
});

// Category Products routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::prefix('category-products')->group(function () {
        Route::get('export', [CategoryProductController::class, 'export'])->name('category-products.export');
        Route::post('import', [CategoryProductController::class, 'import'])->name('category-products.import');
    });
    Route::resource('category-products', CategoryProductController::class)->names('category-products');
});

// Category Blog routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('category-blogs', \App\Http\Controllers\CategoryBlogController::class)->names('category-blogs');
});

// Product routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('products', ProductController::class);
});

require __DIR__.'/auth.php';
