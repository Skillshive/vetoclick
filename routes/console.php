<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule appointment reminders to run daily at 9:00 AM
Schedule::command('appointments:send-reminders')
    ->dailyAt('09:00')
    ->timezone(config('app.timezone'))
    ->description('Send SMS reminders to clients for appointments happening tomorrow');
