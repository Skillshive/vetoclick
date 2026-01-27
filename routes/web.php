<?php

use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\AvailabilityController;
use App\Http\Controllers\HolidayController;
use App\Http\Controllers\BlogController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\CategoryProductController;
use App\Http\Controllers\LanguageController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SpeciesController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\Stock\OrderController;
use App\Http\Controllers\BreedController;
use App\Http\Controllers\CategoryBlogController;
use App\Http\Controllers\ConsultationController;
use App\Http\Controllers\ConsultationNoteController;
use App\Http\Controllers\LotController;
use App\Http\Controllers\NoteController;
use App\Http\Controllers\UserManagment\UserController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\ReceptionistDashboardController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\VetDashboardController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\SubscriptionPlanController;
use App\Http\Controllers\UserDashboardController;
use App\Http\Controllers\PetController;
use App\Http\Controllers\VaccinationController;
use App\Http\Controllers\VaccinController;
use App\Http\Controllers\VaccineProductController;
use App\Services\AppointmentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;

require_once 'common.php';

// Language routes
Route::get('/language/switch/{locale}', [LanguageController::class, 'switch'])->name('language.switch');
Route::get('/api/languages', [LanguageController::class, 'getLanguages'])->name('language.get');

Route::get('/api/auth/check', [\App\Http\Controllers\Auth\AuthenticatedSessionController::class, 'check'])
    ->name('api.auth.check');

// Broadcasting authentication
Route::post('/broadcasting/auth', [\App\Http\Controllers\BroadcastingController::class, 'authenticate'])
    ->middleware('auth')
    ->name('broadcasting.auth');

// OTP routes for registration - need web middleware for session support
// Exclude from CSRF since these are public registration endpoints
Route::post('/api/otp/send', [\App\Http\Controllers\Auth\OtpVerificationController::class, 'sendOtp'])
    ->withoutMiddleware([\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class])
    ->name('api.otp.send');

Route::post('/api/otp/verify', [\App\Http\Controllers\Auth\OtpVerificationController::class, 'verifyOtp'])
    ->withoutMiddleware([\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class])
    ->name('api.otp.verify');

Route::get('/api/user', [\App\Http\Controllers\Api\UserController::class, 'checkAuth'])->name('api.user');

// Notification routes (require authentication) - in web.php for session support
Route::middleware('auth')->prefix('api/notifications')->controller(\App\Http\Controllers\NotificationController::class)->group(function () {
    Route::get('/', 'index')->name('notifications.index');
    Route::get('/latest', 'latest')->name('notifications.latest');
    Route::get('/unread-count', 'unreadCount')->name('notifications.unread-count');
    Route::post('/{id}/read', 'markAsRead')->name('notifications.mark-as-read');
    Route::post('/mark-all-read', 'markAllAsRead')->name('notifications.mark-all-read');
    Route::delete('/{id}', 'destroy')->name('notifications.destroy');
    Route::delete('/read/all', 'deleteAllRead')->name('notifications.delete-all-read');
});

Route::middleware(['auth'])->group(function () {
    Route::post('/api/otp/phone-update/send', [\App\Http\Controllers\Auth\OtpVerificationController::class, 'sendPhoneUpdateOtp'])
        ->name('api.otp.phone-update.send');
    
    Route::post('/api/otp/phone-update/verify', [\App\Http\Controllers\Auth\OtpVerificationController::class, 'verifyPhoneUpdateOtp'])
        ->name('api.otp.phone-update.verify');
});

Route::redirect('/', '/dashboard');

// Dashboard routes - check user role to redirect to appropriate dashboard
// Note: This route handles login tokens first (without auth), then redirects to itself with auth
Route::get('/dashboard', function (AppointmentService $appointmentService, Request $request) {
    // Handle login token if present (for API/JSON login flow)
    if ($request->has('login_token')) {
        $token = $request->input('login_token');
        $userId = Cache::get('login_token_' . $token);
        
        if ($userId) {
            Auth::loginUsingId($userId);
            Cache::forget('login_token_' . $token);
            $request->session()->regenerate();
            
            // Redirect to dashboard without token in URL
            return redirect('/dashboard');
        }
    }
    
    $user = Auth::user();
    
    // If no user is authenticated, redirect to login
    if (!$user) {
        return redirect('/login');
    }
    
    // Check if user is an admin (highest priority)
    if ($user->hasRole('admin')) {
        return app(AdminDashboardController::class)->index();
    }
    // Check if user is a veterinarian
    else if ($user->veterinary) {
        return app(VetDashboardController::class)->index($appointmentService);
    } 
    // Check if user is a receptionist
    else if ($user->hasRole('receptionist')) {
        return app(ReceptionistDashboardController::class)->index();
    } 
    else {
        // Redirect to user dashboard
        return app(UserDashboardController::class)->index();
    }
})->middleware(['web', 'auth'])->name('dashboard'); // FIXED: Added auth middleware

// User dashboard route
Route::get('/user/dashboard', [UserDashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('user.dashboard');

// Receptionist dashboard route
Route::get('/receptionist/dashboard', [App\Http\Controllers\ReceptionistDashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('receptionist.dashboard');

// Admin dashboard route
Route::get('/admin/dashboard', [AdminDashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('admin.dashboard');

// Profile routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'show'])->name('profile.show');
    Route::post('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::post('/profile/password', [ProfileController::class, 'updatePassword'])->name('profile.password.update');
});

// Availability routes
Route::middleware(['auth', 'verified', 'permission:availability.view'])->prefix('availability')->controller(AvailabilityController::class)->group(function () {
    Route::post('/', 'store')->middleware('permission:availability.create')->name('availability.store');
    Route::get('/current-week', 'getCurrentWeek')->name('availability.getCurrentWeek');
    Route::delete('/{uuid}', 'destroy')->middleware('permission:availability.delete')->name('availability.destroy');
    Route::post('/check', 'checkAvailability')->name('availability.check');
});

// Holiday routes
Route::middleware(['auth', 'verified', 'permission:holidays.view'])->prefix('holidays')->controller(HolidayController::class)->group(function () {
    Route::get('/', 'index')->name('holidays.index');
    Route::post('/', 'store')->middleware('permission:holidays.create')->name('holidays.store');
    Route::delete('/{uuid}', 'destroy')->middleware('permission:holidays.delete')->name('holidays.destroy');
    Route::get('/upcoming', 'upcoming')->name('holidays.upcoming');
});

// Species routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::name('species.')->prefix('species')
        ->controller(SpeciesController::class)
        ->group(function () {
            Route::get('', 'index')
                ->name('index');
            Route::get('create', 'create')->middleware('permission:species.create')->name('create');
            Route::post('store', 'store')->middleware('permission:species.create')->name('store');
            Route::get('{species}/edit', 'edit')->middleware('permission:species.edit')->name('edit');
            Route::post('delete', 'destroyGroup')->middleware('permission:species.delete')->name('destroyGroup');
            Route::delete('{species}/delete', 'destroy')->middleware('permission:species.delete')->name('destroy');
            Route::get('{species}/show', 'show')->name('show');
            Route::post('{species}/update', 'update')->middleware('permission:species.edit')->name('update');
        });
});
Route::middleware(['auth', 'verified', 'permission:users.view'])->group(function () {
    Route::name('users.')->prefix('users')
        ->controller(UserController::class)
        ->group(function () {
            Route::get('', 'index')
                ->name('index');
            Route::get('create', 'create')->middleware('permission:users.create')->name('create');
            Route::post('store', 'store')->middleware('permission:users.create')->name('store');
            Route::get('{user}/edit', 'edit')->middleware('permission:users.edit')->name('edit');
            Route::post('delete', 'destroyGroup')->middleware('permission:users.delete')->name('destroyGroup');
            Route::delete('{user}/delete', 'destroy')->middleware('permission:users.delete')->name('destroy');
            Route::get('{user}/show', 'show')->name('show');
            Route::post('{user}/update', 'update')->middleware('permission:users.edit')->name('update');
        });
});

// Breed routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::name('breeds.')->prefix('breeds')
        ->controller(BreedController::class)
        ->group(function () {
            Route::post('store', 'store')->middleware('permission:breeds.create')->name('store');
            Route::post('{breed}/update', 'update')->middleware('permission:breeds.edit')->name('update');
            Route::delete('{breed}/delete', 'destroy')->middleware('permission:breeds.delete')->name('destroy');
            // Get breeds for a specific species
            Route::get('species/{speciesUuid}', 'getBySpecies')->name('by-species');
        });
});

// Client routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::name('clients.')->prefix('clients')
        ->controller(ClientController::class)
        ->group(function () {
            Route::get('', 'index')->name('index');
            Route::post('store', 'store')->name('store');
            Route::post('store-for-appointment', 'storeForAppointment')->name('store-for-appointment');
            Route::put('{uuid}/update', 'update')->middleware('permission:clients.edit')->name('update');
            Route::delete('{uuid}/delete', 'destroy')->middleware('permission:clients.delete')->name('destroy');
        });
});

// Pet routes
Route::middleware(['auth', 'verified', 'permission:pets.view'])->group(function () {
    Route::name('pets.')->prefix('pets')
        ->controller(PetController::class)
        ->group(function () {
            Route::get('', 'index')->name('index');
            Route::get('create', 'create')->middleware('permission:pets.create')->name('create');
            Route::post('store', 'store')->middleware('permission:pets.create')->name('store');
            Route::get('{pet:uuid}/show', 'show')->name('show');
            Route::get('{pet:uuid}/edit', 'edit')->middleware('permission:pets.edit')->name('edit');
            Route::post('{pet:uuid}/update', 'update')->middleware('permission:pets.edit')->name('update');
            Route::delete('{pet:uuid}/delete', 'destroy')->middleware('permission:pets.delete')->name('destroy');
            Route::get('{uuid}/medical-history', 'getMedicalHistory')->name('medical-history');
        });
});

// Supplier routes
Route::middleware(['auth', 'verified', 'permission:suppliers.view'])->group(function () {
    Route::resource('suppliers', SupplierController::class)->middleware([
        'create' => 'permission:suppliers.create',
        'edit' => 'permission:suppliers.edit',
        'destroy' => 'permission:suppliers.delete',
    ]);
    Route::prefix('suppliers')->group(function () {
        Route::get('export', [SupplierController::class, 'export'])->middleware('permission:suppliers.export')->name('suppliers.export');
        Route::post('import', [SupplierController::class, 'import'])->middleware('permission:suppliers.import')->name('suppliers.import');
    });
});

// Order routes
Route::middleware(['auth', 'verified', 'permission:orders.view'])->group(function () {
    Route::name('orders.')->prefix('orders')
        ->controller(OrderController::class)
        ->group(function () {
            Route::get('', 'index')->name('index');
            Route::get('create', 'create')->middleware('permission:orders.create')->name('create');
            Route::post('store', 'store')->middleware('permission:orders.create')->name('store');
            Route::get('{uuid}/edit', 'edit')->middleware('permission:orders.edit')->name('edit');
            Route::put('{uuid}/update', 'update')->middleware('permission:orders.edit')->name('update');
            Route::delete('{uuid}/delete', 'destroy')->middleware('permission:orders.delete')->name('destroy');
            Route::get('{uuid}/show', 'show')->name('show');
            Route::post('{uuid}/confirm', 'confirm')->middleware('permission:orders.confirm')->name('confirm');
            Route::post('{uuid}/receive', 'receive')->middleware('permission:orders.receive')->name('receive');
            Route::post('{uuid}/cancel', 'cancel')->middleware('permission:orders.cancel')->name('cancel');
        });
});

// Category Products routes
Route::middleware(['auth', 'verified', 'permission:category-products.view'])->group(function () {
    Route::prefix('category-products')->group(function () {
        Route::get('export', [CategoryProductController::class, 'export'])->middleware('permission:category-products.export')->name('category-products.export');
        Route::post('import', [CategoryProductController::class, 'import'])->middleware('permission:category-products.import')->name('category-products.import');
    });
    Route::resource('category-products', CategoryProductController::class)->names('category-products')->middleware([
        'create' => 'permission:category-products.create',
        'edit' => 'permission:category-products.edit',
        'destroy' => 'permission:category-products.delete',
    ]);
});

// Category Blog routes
Route::middleware(['auth', 'verified', 'permission:category-blogs.view'])->group(function () {
    Route::prefix('category-blogs')->group(function () {
        Route::get('export', [CategoryBlogController::class, 'export'])->middleware('permission:category-blogs.export')->name('category-blogs.export');
        Route::post('import', [CategoryBlogController::class, 'import'])->middleware('permission:category-blogs.import')->name('category-blogs.import');
    });

    Route::resource('category-blogs', CategoryBlogController::class)->except(['show'])->middleware([
        'create' => 'permission:category-blogs.create',
        'edit' => 'permission:category-blogs.edit',
        'destroy' => 'permission:category-blogs.delete',
    ]);

});

// Blog routes
Route::middleware(['auth', 'verified', 'permission:blogs.view'])->group(function () {
    Route::name('blogs.')->prefix('blogs')
        ->controller(BlogController::class)
        ->group(function () {
            Route::get('', 'index')->name('index');
            Route::get('create', 'create')->middleware('permission:blogs.create')->name('create');
            Route::post('', 'store')->middleware('permission:blogs.create')->name('store');
            Route::get('{blog}', 'show')->name('show');
            Route::get('{blog}/edit', 'edit')->middleware('permission:blogs.edit')->name('edit');
            Route::put('{blog}', 'update')->middleware('permission:blogs.edit')->name('update');
            Route::delete('{blog}', 'destroy')->middleware('permission:blogs.delete')->name('destroy');
            Route::get('search', 'search')->middleware('permission:blogs.search')->name('search');
        });
});
Route::middleware(['auth', 'verified', 'permission:appointments.view'])->group(function () {
    Route::name('appointments.')->prefix('appointments')
        ->controller(AppointmentController::class)
        ->group(function () {
            Route::get('', 'index')->name('index');
            Route::get('calendar', 'calendar')->middleware('permission:appointments.calendar')->name('calendar');
            Route::get('available-times', 'getAvailableTimes')->name('available-times');
            Route::post('{uuid}/create-consultation', 'createConsultation')->middleware('permission:consultations.create')->name('create-consultation');
            Route::post('{uuid}/cancel', 'cancel')->middleware('permission:appointments.cancel')->name('cancel');
            Route::post('{uuid}/report', 'report')->middleware('permission:appointments.report')->name('report');
            Route::get('create', 'create')->name('create');
            Route::post('create-appointment', 'createAppointment')->name('create-appointment');
            Route::post('store', 'store')->name('store');
            Route::post('request', 'requestAppointment')->middleware('permission:appointments.request')->name('request');
            Route::post('{uuid}/accept', 'accept')->middleware('permission:appointments.accept')->name('accept');
            Route::get('{uuid}/join-meeting', 'joinMeeting')->name('join-meeting');
            Route::get('{uuid}/check-meeting-access', 'checkMeetingAccess')->name('check-meeting-access');
            Route::post('{uuid}/track-meeting-start', 'trackMeetingStart')->name('track-meeting-start');
            Route::post('{uuid}/save-recording', 'saveRecording')->name('save-recording');
            Route::post('{uuid}/end-meeting', 'endMeeting')->name('end-meeting');
            Route::get('{uuid}/end-meeting-on-leave', 'endMeetingOnLeave')->name('end-meeting-on-leave');
            Route::post('{uuid}/jitsi-recording-webhook', 'jitsiRecordingWebhook')->name('jitsi-recording-webhook');
        });
});
// Product routes
Route::middleware(['auth', 'verified', 'permission:products.view'])->group(function () {
    Route::prefix('products')->group(function () {
        Route::get('export', [ProductController::class, 'export'])->middleware('permission:products.export')->name('products.export');
    });

    Route::name('products.')->prefix('products')
        ->controller(ProductController::class)
        ->group(function () {
            Route::get('', 'index')->name('index');
            Route::get('create', 'create')->middleware('permission:products.create')->name('create');
            Route::get('form', function () {
                return Inertia::render('Products/ProductForm');
            })->middleware('permission:products.create')->name('form');
            Route::post('store', 'store')->middleware('permission:products.create')->name('store');
            Route::get('{uuid}/edit', 'edit')->middleware('permission:products.edit')->name('edit');
            Route::put('{uuid}/update', 'update')->middleware('permission:products.edit')->name('update');
            Route::get('{uuid}/lots', 'lots')->middleware('permission:lots.view')->name('lots');
            Route::delete('{uuid}/delete', 'destroy')->middleware('permission:products.delete')->name('destroy');
        });

    // Lot routes
    Route::put('lots/{id}', [LotController::class, 'update'])->middleware('permission:lots.edit')->name('lots.update');

    // Vaccin routes (available vaccines list)
    Route::get('vaccins', [VaccinController::class, 'index'])->middleware('permission:vaccinations.view')->name('vaccins.index');
    
    // Vaccine products (from products table where type = VACCINE)
    Route::get('vaccine-products', [VaccineProductController::class, 'index'])->middleware('permission:products.view')->name('vaccine-products.index');

    // Vaccination routes
    Route::post('vaccinations', [VaccinationController::class, 'store'])->middleware('permission:vaccinations.create')->name('vaccinations.store');
    Route::put('vaccinations/{uuid}', [VaccinationController::class, 'update'])->middleware('permission:vaccinations.edit')->name('vaccinations.update');
    Route::delete('vaccinations/{uuid}', [VaccinationController::class, 'destroy'])->middleware('permission:vaccinations.delete')->name('vaccinations.destroy');

    // Allergy routes
    Route::post('allergies', [\App\Http\Controllers\AllergyController::class, 'store'])->middleware('permission:allergies.create')->name('allergies.store');
    Route::put('allergies/{uuid}', [\App\Http\Controllers\AllergyController::class, 'update'])->middleware('permission:allergies.edit')->name('allergies.update');
    Route::delete('allergies/{uuid}', [\App\Http\Controllers\AllergyController::class, 'destroy'])->middleware('permission:allergies.delete')->name('allergies.destroy');

    // Note routes
    Route::post('notes', [NoteController::class, 'store'])->middleware('permission:notes.create')->name('notes.store');
    Route::put('notes/{uuid}', [NoteController::class, 'update'])->middleware('permission:notes.edit')->name('notes.update');
    Route::delete('notes/{uuid}', [NoteController::class, 'destroy'])->middleware('permission:notes.delete')->name('notes.destroy');

    // Prescription routes
    Route::post('prescriptions', [\App\Http\Controllers\PrescriptionController::class, 'store'])->middleware('permission:prescriptions.create')->name('prescriptions.store');
    Route::put('prescriptions/{uuid}', [\App\Http\Controllers\PrescriptionController::class, 'update'])->middleware('permission:prescriptions.edit')->name('prescriptions.update');
    Route::delete('prescriptions/{uuid}', [\App\Http\Controllers\PrescriptionController::class, 'destroy'])->middleware('permission:prescriptions.delete')->name('prescriptions.destroy');

    // Consultation note routes
    Route::post('consultation-notes', [ConsultationNoteController::class, 'store'])->middleware('permission:consultation-notes.create')->name('consultation-notes.store');
    Route::put('consultation-notes/{uuid}', [ConsultationNoteController::class, 'update'])->middleware('permission:consultation-notes.edit')->name('consultation-notes.update');
    Route::delete('consultation-notes/{uuid}', [ConsultationNoteController::class, 'destroy'])->middleware('permission:consultation-notes.delete')->name('consultation-notes.destroy');

    // Consultation routes
    Route::post('consultations/{uuid}/close', [ConsultationController::class, 'close'])->middleware('permission:consultations.close')->name('consultations.close');
});

// Role routes
Route::middleware(['auth', 'verified', 'permission:roles.view'])->group(function () {
    Route::name('roles.')->prefix('roles')
        ->controller(RoleController::class)
        ->group(function () {
            Route::get('', 'index')->name('index');
            Route::post('store', 'store')->middleware('permission:roles.create')->name('store');
            Route::post('{role}/update', 'update')->middleware('permission:roles.edit')->name('update');
            Route::delete('{role}/delete', 'destroy')->middleware('permission:roles.delete')->name('destroy');
            Route::post('{role}/assign-permissions', 'assignPermissions')->middleware('permission:roles.assign-permissions')->name('assign-permissions');
        });
});

// Subscription Plans routes
Route::middleware(['auth', 'verified', 'permission:subscription-plans.view'])->group(function () {
    Route::name('subscription-plans.')->prefix('subscription-plans')
        ->controller(SubscriptionPlanController::class)
        ->group(function () {
            Route::get('/', 'index')->name('index');
            Route::get('/count-active', 'countActive')->name('count-active');
            Route::get('/create', 'create')->middleware('permission:subscription-plans.create')->name('create');
            Route::post('/', 'store')->middleware('permission:subscription-plans.create')->name('store');
            Route::get('/{subscription_plan}', 'show')->name('show');
            Route::get('/{subscription_plan}/edit', 'edit')->middleware('permission:subscription-plans.edit')->name('edit');
            Route::put('/{subscription_plan}', 'update')->middleware('permission:subscription-plans.edit')->name('update');
            Route::patch('/{subscription_plan}/toggle', 'toggle')->middleware('permission:subscription-plans.toggle')->name('toggle');
            Route::delete('/{subscription_plan}', 'destroy')->middleware('permission:subscription-plans.delete')->name('destroy');
        });
});

// Settings routes
Route::middleware(['auth', 'verified', 'permission:settings.view'])->group(function () {
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
        })->middleware('permission:availability.view')->name('availabilities');
        
        Route::get('/holidays', function () {
            return Inertia::render('Settings/Holidays');
        })->middleware('permission:holidays.view')->name('holidays');
    });
});

// Address validation route (exclude CSRF for AJAX)
Route::post('/validate-address', [App\Http\Controllers\AddressValidationController::class, 'validate'])
    ->name('validate-address')
    ->withoutMiddleware(['web']);

require __DIR__.'/auth.php';
