<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Appointment Reminder</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #e3f2fd; padding: 20px; text-align: center; border-radius: 8px; }
        .content { padding: 20px 0; }
        .appointment-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
        .button { display: inline-block; padding: 12px 24px; background: #28a745; color: white; text-decoration: none; border-radius: 5px; margin: 5px; }
        .button.cancel { background: #dc3545; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🗓️ Appointment Reminder</h1>
        </div>
        
        <div class="content">
            <p>Hello {{ $patient_name ?? 'there' }},</p>
            
            <p>This is a friendly reminder about your upcoming appointment.</p>
            
            <div class="appointment-details">
                <h3>Appointment Details</h3>
                <div class="detail-row">
                    <strong>Date:</strong>
                    <span>{{ $date }}</span>
                </div>
                <div class="detail-row">
                    <strong>Time:</strong>
                    <span>{{ $time }}</span>
                </div>
                <div class="detail-row">
                    <strong>Doctor:</strong>
                    <span>{{ $doctor_name }}</span>
                </div>
                <div class="detail-row">
                    <strong>Location:</strong>
                    <span>{{ $location ?? 'Main Clinic' }}</span>
                </div>
                @if(isset($appointment_type))
                <div class="detail-row">
                    <strong>Type:</strong>
                    <span>{{ $appointment_type }}</span>
                </div>
                @endif
            </div>
            
            @if(isset($preparation_instructions))
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <strong>Preparation Instructions:</strong>
                <p>{{ $preparation_instructions }}</p>
            </div>
            @endif
            
            <p style="text-align: center;">
                @if(isset($confirm_url))
                <a href="{{ $confirm_url }}" class="button">Confirm Appointment</a>
                @endif
                @if(isset($reschedule_url))
                <a href="{{ $reschedule_url }}" class="button" style="background: #ffc107; color: #000;">Reschedule</a>
                @endif
                @if(isset($cancel_url))
                <a href="{{ $cancel_url }}" class="button cancel">Cancel</a>
                @endif
            </p>
            
            <p>Please arrive 15 minutes early for check-in. If you need to cancel or reschedule, please do so at least 24 hours in advance.</p>
            
            <p>We look forward to seeing you!</p>
            
            <p>Best regards,<br>{{ $clinic_name ?? config('app.name') }}</p>
        </div>
        
        <div class="footer">
            <p>For questions or to make changes to your appointment, please call us at {{ $phone ?? 'our main number' }}.</p>
        </div>
    </div>
</body>
</html>
