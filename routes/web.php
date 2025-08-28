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

require __DIR__.'/auth.php';
