<?php

namespace App\Services;

use Twilio\Rest\Client;
use Twilio\Exceptions\TwilioException;
use Illuminate\Support\Facades\Log;

class TwilioService
{
    protected Client $twilio;
    protected string $twilioNumber;
    protected string $messagingServiceSid;

    public function __construct()
    {
        $accountSid = config('services.twilio.account_sid');
        $authToken = config('services.twilio.auth_token');
        $this->twilioNumber = config('services.twilio.phone_number');
        $this->messagingServiceSid = config('services.twilio.messaging_service_sid');
        
        $this->twilio = new Client($accountSid, $authToken);
    }

    /**
     * Send a simple SMS message
     */
    public function sendSMS(string $to, string $message, ?string $from = null): array
    {
        try {
            $messageData = [
                'body' => $message,
                'to' => $to,
            ];

            // Use messaging service SID or phone number
            if ($this->messagingServiceSid) {
                $messageData['messagingServiceSid'] = $this->messagingServiceSid;
            } else {
                $messageData['from'] = $from ?? $this->twilioNumber;
            }

            $twilioMessage = $this->twilio->messages->create($messageData);

            return [
                'success' => true,
                'sid' => $twilioMessage->sid,
                'status' => $twilioMessage->status,
                'message' => 'SMS sent successfully'
            ];
        } catch (TwilioException $e) {
            Log::error('Twilio SMS Error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Send WhatsApp message
     */
    public function sendWhatsApp(string $to, string $message, array $mediaUrls = []): array
    {
        try {
            $messageData = [
                'body' => $message,
                'from' => 'whatsapp:' . $this->twilioNumber,
                'to' => 'whatsapp:' . $to
            ];

            if (!empty($mediaUrls)) {
                $messageData['mediaUrl'] = $mediaUrls;
            }

            $twilioMessage = $this->twilio->messages->create($messageData);

            return [
                'success' => true,
                'sid' => $twilioMessage->sid,
                'status' => $twilioMessage->status,
                'message' => 'WhatsApp message sent successfully'
            ];
        } catch (TwilioException $e) {
            Log::error('Twilio WhatsApp Error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Send bulk SMS messages
     */
    public function sendBulkSMS(array $recipients, string $message, ?string $from = null): array
    {
        $results = [];
        $successCount = 0;
        $failureCount = 0;

        foreach ($recipients as $recipient) {
            $result = $this->sendSMS($recipient, $message, $from);
            $results[] = [
                'recipient' => $recipient,
                'result' => $result
            ];

            if ($result['success']) {
                $successCount++;
            } else {
                $failureCount++;
            }
        }

        return [
            'total_sent' => count($recipients),
            'success_count' => $successCount,
            'failure_count' => $failureCount,
            'results' => $results
        ];
    }

    /**
     * Send SMS with delivery status callback
     */
    public function sendSMSWithCallback(string $to, string $message, string $callbackUrl, ?string $from = null): array
    {
        try {
            $messageData = [
                'body' => $message,
                'to' => $to,
                'statusCallback' => $callbackUrl
            ];

            if ($this->messagingServiceSid) {
                $messageData['messagingServiceSid'] = $this->messagingServiceSid;
            } else {
                $messageData['from'] = $from ?? $this->twilioNumber;
            }

            $twilioMessage = $this->twilio->messages->create($messageData);

            return [
                'success' => true,
                'sid' => $twilioMessage->sid,
                'status' => $twilioMessage->status,
                'message' => 'SMS with callback sent successfully'
            ];
        } catch (TwilioException $e) {
            Log::error('Twilio SMS Callback Error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Schedule a message to be sent later
     */
    public function scheduleMessage(string $to, string $message, \DateTime $sendAt, ?string $from = null): array
    {
        try {
            $messageData = [
                'body' => $message,
                'to' => $to,
                'scheduleType' => 'fixed',
                'sendAt' => $sendAt->format('c') // ISO 8601 format
            ];

            if ($this->messagingServiceSid) {
                $messageData['messagingServiceSid'] = $this->messagingServiceSid;
            } else {
                $messageData['from'] = $from ?? $this->twilioNumber;
            }

            $twilioMessage = $this->twilio->messages->create($messageData);

            return [
                'success' => true,
                'sid' => $twilioMessage->sid,
                'status' => $twilioMessage->status,
                'message' => 'Message scheduled successfully'
            ];
        } catch (TwilioException $e) {
            Log::error('Twilio Schedule Error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Get message status and details
     */
    public function getMessageStatus(string $messageSid): array
    {
        try {
            $message = $this->twilio->messages($messageSid)->fetch();

            return [
                'success' => true,
                'sid' => $message->sid,
                'status' => $message->status,
                'direction' => $message->direction,
                'from' => $message->from,
                'to' => $message->to,
                'body' => $message->body,
                'date_created' => $message->dateCreated->format('Y-m-d H:i:s'),
                'date_sent' => $message->dateSent ? $message->dateSent->format('Y-m-d H:i:s') : null,
                'error_code' => $message->errorCode,
                'error_message' => $message->errorMessage,
                'price' => $message->price,
                'price_unit' => $message->priceUnit
            ];
        } catch (TwilioException $e) {
            Log::error('Twilio Get Message Error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Send SMS with smart encoding (automatically handles long messages)
     */
    public function sendSmartSMS(string $to, string $message, ?string $from = null): array
    {
        try {
            $messageData = [
                'body' => $message,
                'to' => $to,
                'smartEncoded' => true
            ];

            if ($this->messagingServiceSid) {
                $messageData['messagingServiceSid'] = $this->messagingServiceSid;
            } else {
                $messageData['from'] = $from ?? $this->twilioNumber;
            }

            $twilioMessage = $this->twilio->messages->create($messageData);

            return [
                'success' => true,
                'sid' => $twilioMessage->sid,
                'status' => $twilioMessage->status,
                'message' => 'Smart SMS sent successfully',
                'num_segments' => $twilioMessage->numSegments
            ];
        } catch (TwilioException $e) {
            Log::error('Twilio Smart SMS Error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Validate phone number
     */
    public function validatePhoneNumber(string $phoneNumber): array
    {
        try {
            $lookup = $this->twilio->lookups->v1->phoneNumbers($phoneNumber)
                                              ->fetch(['type' => ['carrier']]);

            return [
                'success' => true,
                'phone_number' => $lookup->phoneNumber,
                'national_format' => $lookup->nationalFormat,
                'country_code' => $lookup->countryCode,
                'carrier' => $lookup->carrier,
                'valid' => true
            ];
        } catch (TwilioException $e) {
            Log::error('Twilio Phone Validation Error: ' . $e->getMessage());
            return [
                'success' => false,
                'valid' => false,
                'error' => $e->getMessage()
            ];
        }
    }
}