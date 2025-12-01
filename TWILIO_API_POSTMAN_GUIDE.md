# Twilio API Postman Guide

This guide provides step-by-step instructions on how to test the Twilio API endpoints using Postman.

## Base URL

All endpoints are prefixed with `/api/twilio`. The full base URL will be:
```
http://your-domain.com/api/twilio
```

## Authentication

Make sure your Laravel application has proper authentication middleware if required. For testing purposes, you may need to:
- Add your API token to the request headers
- Or configure your routes to allow unauthenticated access for testing

## Endpoints Overview

1. **Send SMS** - `POST /api/twilio/sms/send`
2. **Send Bulk SMS** - `POST /api/twilio/sms/send-bulk`
3. **Send Smart SMS** - `POST /api/twilio/sms/send-smart`
4. **Send SMS with Callback** - `POST /api/twilio/sms/send-with-callback`
5. **Schedule Message** - `POST /api/twilio/sms/schedule`
6. **Get Message Status** - `GET /api/twilio/sms/status`
7. **Send WhatsApp** - `POST /api/twilio/whatsapp/send`
8. **Validate Phone Number** - `POST /api/twilio/phone/validate`

---

## 1. Send SMS

**Endpoint:** `POST /api/twilio/sms/send`

**Description:** Send a simple SMS message to a phone number.

### Request Body (JSON):
```json
{
    "to": "+1234567890",
    "message": "Hello, this is a test message!",
    "from": "+1234567890"
}
```

### Parameters:
- `to` (required): Recipient phone number in E.164 format (e.g., +1234567890)
- `message` (required): The message content
- `from` (optional): Sender phone number. If not provided, uses default from config

### Postman Setup:
1. Method: **POST**
2. URL: `http://your-domain.com/api/twilio/sms/send`
3. Headers:
   - `Content-Type: application/json`
   - `Accept: application/json`
4. Body (raw JSON):
```json
{
    "to": "+1234567890",
    "message": "Hello from Postman!",
    "from": "+1234567890"
}
```

### Success Response (200):
```json
{
    "success": true,
    "sid": "SM1234567890abcdef",
    "status": "queued",
    "message": "SMS sent successfully"
}
```

### Error Response (400):
```json
{
    "success": false,
    "error": "Error message here"
}
```

---

## 2. Send Bulk SMS

**Endpoint:** `POST /api/twilio/sms/send-bulk`

**Description:** Send the same SMS message to multiple recipients.

### Request Body (JSON):
```json
{
    "recipients": [
        "+1234567890",
        "+0987654321",
        "+1122334455"
    ],
    "message": "Bulk message to all recipients",
    "from": "+1234567890"
}
```

### Parameters:
- `recipients` (required, array): Array of phone numbers in E.164 format
- `message` (required): The message content to send to all recipients
- `from` (optional): Sender phone number

### Postman Setup:
1. Method: **POST**
2. URL: `http://your-domain.com/api/twilio/sms/send-bulk`
3. Headers:
   - `Content-Type: application/json`
   - `Accept: application/json`
4. Body (raw JSON):
```json
{
    "recipients": [
        "+1234567890",
        "+0987654321"
    ],
    "message": "This is a bulk message"
}
```

### Success Response (200):
```json
{
    "total_sent": 2,
    "success_count": 2,
    "failure_count": 0,
    "results": [
        {
            "recipient": "+1234567890",
            "result": {
                "success": true,
                "sid": "SM1234567890abcdef",
                "status": "queued"
            }
        },
        {
            "recipient": "+0987654321",
            "result": {
                "success": true,
                "sid": "SM0987654321abcdef",
                "status": "queued"
            }
        }
    ]
}
```

---

## 3. Send Smart SMS

**Endpoint:** `POST /api/twilio/sms/send-smart`

**Description:** Send SMS with smart encoding that automatically handles long messages by splitting them into multiple segments.

### Request Body (JSON):
```json
{
    "to": "+1234567890",
    "message": "This is a very long message that will be automatically split into multiple segments if it exceeds the character limit for a single SMS message...",
    "from": "+1234567890"
}
```

### Postman Setup:
1. Method: **POST**
2. URL: `http://your-domain.com/api/twilio/sms/send-smart`
3. Headers:
   - `Content-Type: application/json`
   - `Accept: application/json`
4. Body (raw JSON):
```json
{
    "to": "+1234567890",
    "message": "This is a long message that will be split automatically..."
}
```

### Success Response (200):
```json
{
    "success": true,
    "sid": "SM1234567890abcdef",
    "status": "queued",
    "message": "Smart SMS sent successfully",
    "num_segments": 2
}
```

---

## 4. Send SMS with Callback

**Endpoint:** `POST /api/twilio/sms/send-with-callback`

**Description:** Send SMS with a delivery status callback URL that Twilio will call when the message status changes.

### Request Body (JSON):
```json
{
    "to": "+1234567890",
    "message": "Message with callback",
    "callback_url": "https://your-domain.com/api/twilio/webhook/status",
    "from": "+1234567890"
}
```

### Parameters:
- `to` (required): Recipient phone number
- `message` (required): The message content
- `callback_url` (required): URL where Twilio will send status updates
- `from` (optional): Sender phone number

### Postman Setup:
1. Method: **POST**
2. URL: `http://your-domain.com/api/twilio/sms/send-with-callback`
3. Headers:
   - `Content-Type: application/json`
   - `Accept: application/json`
4. Body (raw JSON):
```json
{
    "to": "+1234567890",
    "message": "Message with status callback",
    "callback_url": "https://your-domain.com/api/twilio/webhook/status"
}
```

### Success Response (200):
```json
{
    "success": true,
    "sid": "SM1234567890abcdef",
    "status": "queued",
    "message": "SMS with callback sent successfully"
}
```

---

## 5. Schedule Message

**Endpoint:** `POST /api/twilio/sms/schedule`

**Description:** Schedule an SMS message to be sent at a specific date and time in the future.

### Request Body (JSON):
```json
{
    "to": "+1234567890",
    "message": "This is a scheduled message",
    "send_at": "2024-12-25 10:00:00",
    "from": "+1234567890"
}
```

### Parameters:
- `to` (required): Recipient phone number
- `message` (required): The message content
- `send_at` (required): Date and time in format `Y-m-d H:i:s` or ISO 8601. Must be in the future.
- `from` (optional): Sender phone number

### Postman Setup:
1. Method: **POST**
2. URL: `http://your-domain.com/api/twilio/sms/schedule`
3. Headers:
   - `Content-Type: application/json`
   - `Accept: application/json`
4. Body (raw JSON):
```json
{
    "to": "+1234567890",
    "message": "This message will be sent later",
    "send_at": "2024-12-25 10:00:00"
}
```

### Success Response (200):
```json
{
    "success": true,
    "sid": "SM1234567890abcdef",
    "status": "scheduled",
    "message": "Message scheduled successfully"
}
```

---

## 6. Get Message Status

**Endpoint:** `GET /api/twilio/sms/status`

**Description:** Retrieve the status and details of a previously sent message using its SID.

### Query Parameters:
- `message_sid` (required): The Twilio message SID (e.g., SM1234567890abcdef)

### Postman Setup:
1. Method: **GET**
2. URL: `http://your-domain.com/api/twilio/sms/status?message_sid=SM1234567890abcdef`
3. Headers:
   - `Accept: application/json`

### Success Response (200):
```json
{
    "success": true,
    "sid": "SM1234567890abcdef",
    "status": "delivered",
    "direction": "outbound-api",
    "from": "+1234567890",
    "to": "+0987654321",
    "body": "Hello from Postman!",
    "date_created": "2024-01-15 10:30:00",
    "date_sent": "2024-01-15 10:30:05",
    "error_code": null,
    "error_message": null,
    "price": "-0.00750",
    "price_unit": "USD"
}
```

---

## 7. Send WhatsApp Message

**Endpoint:** `POST /api/twilio/whatsapp/send`

**Description:** Send a WhatsApp message. Your Twilio number must be configured for WhatsApp.

### Request Body (JSON):
```json
{
    "to": "+1234567890",
    "message": "Hello via WhatsApp!",
    "media_urls": [
        "https://example.com/image.jpg"
    ]
}
```

### Parameters:
- `to` (required): Recipient phone number (without whatsapp: prefix)
- `message` (required): The message content
- `media_urls` (optional, array): Array of media URLs to attach

### Postman Setup:
1. Method: **POST**
2. URL: `http://your-domain.com/api/twilio/whatsapp/send`
3. Headers:
   - `Content-Type: application/json`
   - `Accept: application/json`
4. Body (raw JSON):
```json
{
    "to": "+1234567890",
    "message": "Hello from WhatsApp API!"
}
```

### With Media:
```json
{
    "to": "+1234567890",
    "message": "Check out this image!",
    "media_urls": [
        "https://example.com/image.jpg"
    ]
}
```

### Success Response (200):
```json
{
    "success": true,
    "sid": "SM1234567890abcdef",
    "status": "queued",
    "message": "WhatsApp message sent successfully"
}
```

---

## 8. Validate Phone Number

**Endpoint:** `POST /api/twilio/phone/validate`

**Description:** Validate a phone number and get carrier information using Twilio's Lookup API.

### Request Body (JSON):
```json
{
    "phone_number": "+1234567890"
}
```

### Parameters:
- `phone_number` (required): Phone number to validate in E.164 format

### Postman Setup:
1. Method: **POST**
2. URL: `http://your-domain.com/api/twilio/phone/validate`
3. Headers:
   - `Content-Type: application/json`
   - `Accept: application/json`
4. Body (raw JSON):
```json
{
    "phone_number": "+1234567890"
}
```

### Success Response (200):
```json
{
    "success": true,
    "phone_number": "+1234567890",
    "national_format": "(234) 567-8900",
    "country_code": "US",
    "carrier": {
        "type": "mobile",
        "name": "Verizon Wireless"
    },
    "valid": true
}
```

### Error Response (400):
```json
{
    "success": false,
    "valid": false,
    "error": "The phone number provided is not a valid number"
}
```

---

## Postman Collection Setup

### Step 1: Create a New Collection
1. Open Postman
2. Click "New" → "Collection"
3. Name it "Twilio API"

### Step 2: Set Collection Variables
1. Click on the collection
2. Go to "Variables" tab
3. Add these variables:
   - `base_url`: `http://your-domain.com/api/twilio`
   - `test_phone`: `+1234567890` (your test phone number)
   - `from_phone`: `+1234567890` (your Twilio phone number)

### Step 3: Create Requests
For each endpoint above:
1. Click "Add Request" in the collection
2. Set the method and URL
3. Use `{{base_url}}` in URLs (e.g., `{{base_url}}/sms/send`)
4. Use `{{test_phone}}` and `{{from_phone}}` in request bodies

### Step 4: Add Tests (Optional)
You can add tests to verify responses:
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has success field", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('success');
});
```

---

## Common Issues and Solutions

### 1. 401 Unauthorized
- **Solution**: Check if authentication is required. You may need to add an API token or disable auth for testing.

### 2. 422 Validation Error
- **Solution**: Check that all required fields are present and in the correct format. Phone numbers must be in E.164 format (+country code + number).

### 3. 400 Bad Request with Twilio Error
- **Solution**: Check your Twilio credentials in `.env`:
  - `TWILIO_ACCOUNT_SID`
  - `TWILIO_AUTH_TOKEN`
  - `TWILIO_PHONE_NUMBER`
  - `TWILIO_MESSAGING_SERVICE_SID` (optional)

### 4. Phone Number Format
- Always use E.164 format: `+[country code][number]`
- Example: `+1234567890` (US), `+447911123456` (UK)

### 5. Testing WhatsApp
- Your Twilio number must be approved for WhatsApp messaging
- Recipient must have opted in to receive messages from your number

---

## Environment Variables

Make sure your `.env` file has:
```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_MESSAGING_SERVICE_SID=your_messaging_service_sid
```

---

## Quick Test Checklist

- [ ] Twilio credentials configured in `.env`
- [ ] API routes are accessible
- [ ] Test phone number is in E.164 format
- [ ] Postman collection created with all endpoints
- [ ] Test each endpoint with valid data
- [ ] Verify responses match expected format

---

## Additional Resources

- [Twilio API Documentation](https://www.twilio.com/docs/sms)
- [E.164 Phone Number Format](https://www.twilio.com/docs/glossary/what-e164)
- [Laravel API Documentation](https://laravel.com/docs/api)

