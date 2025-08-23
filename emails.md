# EmailService API Testing with Postman (Queue-Based)

## Base URL
```
http://localhost:8000/api/email
```

## 1. Send Basic Email (Queued)
**POST** `/send`

### Headers
```
Content-Type: application/json
Accept: application/json
```

### Body (JSON)
```json
{
    "to": "test@example.com",
    "subject": "Test Email",
    "body": "<h1>Hello World!</h1><p>This is a test email from EmailService.</p>",
    "from": "sender@yourdomain.com",
    "is_html": true,
    "cc": ["cc@example.com"],
    "bcc": ["bcc@example.com"],
    "reply_to": "noreply@yourdomain.com",
    "priority": 1,
    "delay": 30
}
```

### Response Example
```json
{
    "success": true,
    "message": "Email queued successfully",
    "recipients": ["test@example.com"],
    "provider": "smtp",
    "queued_at": "2025-08-23 18:30:00"
}
```

---

## 2. Send Template Email (Queued)
**POST** `/send-template`

### Body (JSON)
```json
{
    "to": "user@example.com",
    "subject": "Welcome to {{app_name}}!",
    "template": "emails.welcome",
    "data": {
        "name": "John Doe",
        "app_name": "VetoClick",
        "email": "user@example.com",
        "verification_url": "https://yourdomain.com/verify/abc123"
    },
    "from": "welcome@yourdomain.com",
    "delay": 60
}
```

---

## 3. Send Bulk Emails (Queued with Progressive Delay)
**POST** `/send-bulk`

### Body (JSON)
```json
{
    "recipients": [
        "user1@example.com",
        "user2@example.com"
    ],
    "subject": "Hello from VetoClick!",
    "body": "<p>Dear user,</p><p>Thank you for being part of our community.</p>",
    "delay_ms": 2000
}
```

### Response Example
```json
{
    "total_queued": 2,
    "success_count": 2,
    "failure_count": 0,
    "results": [
        {
            "recipient": "user1@example.com",
            "result": {
                "success": true,
                "message": "Email queued successfully"
            }
        }
    ],
    "message": "All emails queued for bulk sending"
}
```

---

## Queue Management

### Start Queue Worker
```bash
php artisan queue:work
```

### Check Queue Status
```bash
php artisan queue:monitor
```

### Environment Variables Required
```env
QUEUE_CONNECTION=database
MAIL_MAILER=smtp
MAIL_HOST=smtp-relay.brevo.com
MAIL_PORT=587
MAIL_USERNAME=your-brevo-email@domain.com
MAIL_PASSWORD=your-brevo-smtp-key
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your-verified-sender@domain.com
MAIL_FROM_NAME="${APP_NAME}"
```

## Benefits of Queue-Based Email System

- **Performance**: Non-blocking email sending
- **Reliability**: Failed emails can be retried
- **Scalability**: Handle large volumes efficiently  
- **Rate Limiting**: Progressive delays prevent overwhelming SMTP servers
- **Monitoring**: Track email job status and failures