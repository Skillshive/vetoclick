<?php

use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\AvailabilityController;
use App\Http\Controllers\BlogController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\CategoryProductController;
use App\Http\Controllers\LanguageController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SpeciesController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\BreedController;
use App\Http\Controllers\CategoryBlogController;
use App\Http\Controllers\UserManagment\UserController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\RoleManagementController;
use App\Http\Controllers\SubscriptionPlanController;
use App\Models\Client;
use App\Services\AppointmentService;
use App\Http\Resources\AppointmentResource;
use Illuminate\Support\Facades\Auth;

require_once 'common.php';

// Language routes
Route::get('/language/switch/{locale}', [LanguageController::class, 'switch'])->name('language.switch');
Route::get('/api/languages', [LanguageController::class, 'getLanguages'])->name('language.get');


Route::redirect('/', '/dashboard');

Route::get('/dashboard', function (AppointmentService $appointmentService) {
    $clients = Client::all()->mapWithKeys(function ($client) {
        return [$client->uuid => $client->first_name];
    });
    
    // Get today's appointments for the logged-in veterinary
    $user = Auth::user();
    $veterinaryId = null;
    if ($user && $user->veterinary) {
        $veterinaryId = $user->veterinary->id;
    }
    
    $todayAppointments = $appointmentService->getTodayAppointments($veterinaryId);
    
    return Inertia::render('Dashboards/Vet/index')->with([
        "clients" => $clients,
        "todayAppointments" => AppointmentResource::collection($todayAppointments)->toArray(request()),
    ]);
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
            Route::get('create', 'create')->name('create');
            Route::post('store', 'store')->name('store');
            Route::get('{species}/edit', 'edit')->name('edit');
            Route::post('delete', 'destroyGroup')->name('destroyGroup');
            Route::delete('{species}/delete', 'destroy')->name('destroy');
            Route::get('{species}/show', 'show')->name('show');
            Route::post('{species}/update', 'update')->name('update');
        });
});
Route::middleware(['auth', 'verified'])->group(function () {
    Route::name('users.')->prefix('users')
        ->controller(UserController::class)
        ->group(function () {
            Route::get('', 'index')
                ->name('index');
            Route::get('create', 'create')->name('create');
            Route::post('store', 'store')->name('store');
            Route::get('{user}/edit', 'edit')->name('edit');
            Route::post('delete', 'destroyGroup')->name('destroyGroup');
            Route::delete('{user}/delete', 'destroy')->name('destroy');
            Route::get('{user}/show', 'show')->name('show');
            Route::post('{user}/update', 'update')->name('update');
        });
});

// Breed routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::name('breeds.')->prefix('breeds')
        ->controller(BreedController::class)
        ->group(function () {
            Route::post('store', 'store')->name('store');
            Route::post('{breed}/update', 'update')->name('update');
            Route::delete('{breed}/delete', 'destroy')->name('destroy');
            // Get breeds for a specific species
            Route::get('species/{speciesUuid}', 'getBySpecies')->name('by-species');
        });
});

// Supplier routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('suppliers', SupplierController::class);
    Route::prefix('suppliers')->group(function () {
        Route::get('export', [SupplierController::class, 'export'])->name('suppliers.export');
        Route::post('import', [SupplierController::class, 'import'])->name('suppliers.import');
    });
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
    Route::prefix('category-blogs')->group(function () {
        Route::get('export', [CategoryBlogController::class, 'export'])->name('category-blogs.export');
        Route::post('import', [CategoryBlogController::class, 'import'])->name('category-blogs.import');
    });

    // Route::name('category-blogs.')->prefix('category-blogs')
    //     ->controller(CategoryBlogController::class)
    //     ->group(function () {
    //         Route::get('', 'index')->name('index');
    //         Route::get('create', 'create')->name('create');
    //         Route::post('store', 'store')->name('store');
    //         Route::get('{categoryBlog}/edit', 'edit')->name('edit');
    //         Route::put('{categoryBlog}/update', 'update')->name('update');
    //         Route::delete('{categoryBlog}/delete', 'destroy')->name('destroy');
    //     });

    Route::resource('category-blogs', CategoryBlogController::class)->except(['show']);

});

// Blog routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::name('blogs.')->prefix('blogs')
        ->controller(BlogController::class)
        ->group(function () {
            Route::get('', 'index')->name('index');
            Route::get('create', 'create')->name('create');
            Route::post('', 'store')->name('store');
            Route::get('{blog}', 'show')->name('show');
            Route::get('{blog}/edit', 'edit')->name('edit');
            Route::put('{blog}', 'update')->name('update');
            Route::delete('{blog}', 'destroy')->name('destroy');
            Route::get('search', 'search')->name('search');
        });
});
Route::middleware(['auth', 'verified'])->group(function () {
    Route::name('appointments.')->prefix('appointments')
        ->controller(AppointmentController::class)
        ->group(function () {
            Route::get('', 'index')->name('index');
            Route::delete('{uuid}/cancel', 'cancel')->name('cancel');
            Route::post('{uuid}/report', 'report')->name('report');
            Route::get('create', function () {
                return Inertia::render('Appointments/Create');
            })->name('create');
            Route::post('store', 'store')->name('store');
            Route::get('{uuid}/join-meeting', 'joinMeeting')->name('join-meeting');
            Route::get('{uuid}/check-meeting-access', 'checkMeetingAccess')->name('check-meeting-access');
        });
});
// Product routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::prefix('products')->group(function () {
        Route::get('export', [ProductController::class, 'export'])->name('products.export');
    });

    Route::name('products.')->prefix('products')
        ->controller(ProductController::class)
        ->group(function () {
            Route::get('', 'index')->name('index');
            Route::get('create', 'create')->name('create');
            Route::get('form', function () {
                return Inertia::render('Products/ProductForm');
            })->name('form');
            Route::post('store', 'store')->name('store');
            Route::get('{uuid}/edit', 'edit')->name('edit');
            Route::put('{uuid}/update', 'update')->name('update');
            Route::delete('{uuid}/delete', 'destroy')->name('destroy');
        });
});

// Role routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::name('roles.')->prefix('roles')
        ->controller(RoleController::class)
        ->group(function () {
            Route::get('', 'index')->name('index');
            Route::post('store', 'store')->name('store');
            Route::post('{role}/update', 'update')->name('update');
            Route::delete('{role}/delete', 'destroy')->name('destroy');
            Route::post('{role}/assign-permissions', 'assignPermissions')->name('assign-permissions');
        });
});

// Subscription Plans routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::name('subscription-plans.')->prefix('subscription-plans')
        ->controller(SubscriptionPlanController::class)
        ->group(function () {
            Route::get('/', 'index')->name('index');
            Route::get('/count-active', 'countActive')->name('count-active');
            Route::get('/create', 'create')->name('create');
            Route::post('/', 'store')->name('store');
            Route::get('/{subscription_plan}', 'show')->name('show');
            Route::get('/{subscription_plan}/edit', 'edit')->name('edit');
            Route::put('/{subscription_plan}', 'update')->name('update');
            Route::patch('/{subscription_plan}/toggle', 'toggle')->name('toggle');
            Route::delete('/{subscription_plan}', 'destroy')->name('destroy');
        });
});

// Settings routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::name('settings.')->prefix('settings')->group(function () {
        Route::get('/', function () {
            return Inertia::render('Settings/Index');
        })->name('index');
        
        Route::get('/general', [ProfileController::class, 'show'])->name('general');
        
        Route::get('/appearance', function () {
            return Inertia::render('Settings/Appearance');
        })->name('appearance');
        
        Route::get('/sessions', function () {
            return Inertia::render('Settings/Sessions');
        })->name('sessions');
        
        Route::get('/availabilities', function () {
            return Inertia::render('Settings/Availabilities');
        })->name('availabilities');
    });
});

// Address validation route (exclude CSRF for AJAX)
Route::post('/validate-address', [App\Http\Controllers\AddressValidationController::class, 'validate'])
    ->name('validate-address')
    ->withoutMiddleware(['web']);

require __DIR__.'/auth.php';
