# EmailService API Testing with Postman

## Base URL
```
http://localhost:8000/api/email
```

## 1. Send Basic Email
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
    "priority": 1
}
```

### Response Example
```json
{
    "success": true,
    "message": "Email sent successfully",
    "recipients": ["test@example.com"],
    "provider": "smtp"
}
```

---

## 2. Send Template Email
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
    "from": "welcome@yourdomain.com"
}
```

---

## 3. Send Bulk Emails
**POST** `/send-bulk`

### Body (JSON)
```json
{
    "recipients": [
        "user1@example.com"
        "user2@example.com"
    ],
    "subject": "Hello {{name}} from {{company}}!",
    "body": "<p>Dear {{name}},</p><p>Thank you for being part of {{company}}.</p>",
    "delay_ms": 1000
}
```