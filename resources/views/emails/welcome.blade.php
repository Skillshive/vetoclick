<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Welcome to {{ $app_name ?? config('app.name') }}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; }
        .content { padding: 20px 0; }
        .button { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to {{ $app_name ?? config('app.name') }}!</h1>
        </div>
        
        <div class="content">
            <p>Hello {{ $name ?? 'there' }},</p>
            
            <p>Welcome to {{ $app_name ?? config('app.name') }}! We're excited to have you join our community.</p>
            
            <p>Your account has been successfully created and you can now access all our features.</p>
            
            @if(isset($verification_url))
            <p>To get started, please verify your email address by clicking the button below:</p>
            <p style="text-align: center;">
                <a href="{{ $verification_url }}" class="button">Verify Email Address</a>
            </p>
            @endif
            
            <p>If you have any questions or need assistance, feel free to contact our support team.</p>
            
            <p>Best regards,<br>The {{ $app_name ?? config('app.name') }} Team</p>
        </div>
        
        <div class="footer">
            <p>This email was sent to {{ $email ?? 'your email address' }}. If you didn't create an account, please ignore this email.</p>
        </div>
    </div>
</body>
</html>
