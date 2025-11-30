<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'redirect' => env('GOOGLE_REDIRECT_URI'),
    ],

    'openstreetmap' => [
        'nominatim_url' => 'https://nominatim.openstreetmap.org/search',
        'user_agent' => 'VetoClick/1.0 (Address Validation)',
    ],

    'twilio' => [
        'account_sid' => env('TWILIO_ACCOUNT_SID'),
        'auth_token' => env('TWILIO_AUTH_TOKEN'),
        'phone_number' => env('TWILIO_PHONE_NUMBER'),
        'messaging_service_sid' => env('TWILIO_MESSAGING_SERVICE_SID'),
    ],

    'jitsi' => [
        'domain' => env('JITSI_DOMAIN', 'jitsi.colabcorner.com'),
        // Redirect URL when user leaves the meeting (defaults to dashboard)
        'redirect_url' => env('JITSI_REDIRECT_URL', '/dashboard'),
        'branding' => [
            // Display name shown in Jitsi Meet interface
            'display_name' => env('JITSI_BRANDING_DISPLAY_NAME', 'VetoClick'),
            // Logo URL - must be publicly accessible via HTTPS
            // Use full URL if Jitsi server is on different domain
            // Example: 'https://yourdomain.com/assets/logo.png'
            'logo_url' => env('JITSI_BRANDING_LOGO_URL', '/assets/logo.png'),
            // Watermark logo URL (optional)
            'watermark_url' => env('JITSI_BRANDING_WATERMARK_URL', null),
            // Watermark link (optional)
            'watermark_link' => env('JITSI_BRANDING_WATERMARK_LINK', null),
            // VetoClick brand colors
            'primary_color' => env('JITSI_BRANDING_PRIMARY_COLOR', '#42B8B2'), // VetoClick teal
            'secondary_color' => env('JITSI_BRANDING_SECONDARY_COLOR', '#1A2B40'), // VetoClick dark blue
        ],
    ],

];
