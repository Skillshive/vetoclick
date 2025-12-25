<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Broadcast;
use Pusher\Pusher;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(\App\Services\RoleService::class);
        $this->app->bind(\App\Services\PermissionService::class);

        // Register Pusher instance
        $this->app->singleton('pusher', function ($app) {
            $config = $app['config']['broadcasting.connections.pusher'];
            
            return new Pusher(
                $config['key'],
                $config['secret'],
                $config['app_id'],
                $config['options'] ?? []
            );
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
        
        // Fix for MySQL "Specified key was too long" error
        Schema::defaultStringLength(191);

        // Register broadcasting routes
        Broadcast::routes(['middleware' => ['web', 'auth']]);
    }
}
