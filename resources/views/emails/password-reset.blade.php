<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Reset Your Password</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; }
        .content { padding: 20px 0; }
        .button { display: inline-block; padding: 12px 24px; background: #dc3545; color: white; text-decoration: none; border-radius: 5px; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Password Reset Request</h1>
        </div>
        
        <div class="content">
            <p>Hello {{ $name ?? 'there' }},</p>
            
            <p>You recently requested to reset your password for your {{ $app_name ?? config('app.name') }} account.</p>
            
            <p style="text-align: center;">
                <a href="{{ $reset_url }}" class="button">Reset Password</a>
            </p>
            
            <div class="warning">
                <strong>Security Notice:</strong> This password reset link will expire in {{ $expires_in ?? '60' }} minutes for your security.
            </div>
            
            <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
            
            <p>For security reasons, please don't share this email with anyone.</p>
            
            <p>Best regards,<br>The {{ $app_name ?? config('app.name') }} Team</p>
        </div>
        
        <div class="footer">
            <p>If you're having trouble clicking the button, copy and paste the URL below into your web browser:</p>
            <p style="word-break: break-all;">{{ $reset_url }}</p>
        </div>
    </div>
</body>
</html>
