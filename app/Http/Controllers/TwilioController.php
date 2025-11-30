<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Services\TwilioService;
use Illuminate\Support\Facades\Validator;

class TwilioController extends Controller
{
    protected TwilioService $twilioService;

    public function __construct(TwilioService $twilioService)
    {
        $this->twilioService = $twilioService;
    }

    /**
     * Send a simple SMS message
     */
    public function sendSMS(Request $request): JsonResponse
    {
        $request->validate([
            'to' => 'required|string',
            'message' => 'required|string',
            'from' => 'nullable|string'
        ]);

        $result = $this->twilioService->sendSMS(
            $request->to,
            $request->message,
            $request->from
        );

        return response()->json($result, $result['success'] ? 200 : 400);
    }

    /**
     * Send WhatsApp message
     */
    public function sendWhatsApp(Request $request): JsonResponse
    {
        $request->validate([
            'to' => 'required|string',
            'message' => 'required|string',
            'media_urls' => 'nullable|array',
            'media_urls.*' => 'url'
        ]);

        $result = $this->twilioService->sendWhatsApp(
            $request->to,
            $request->message,
            $request->media_urls ?? []
        );

        return response()->json($result, $result['success'] ? 200 : 400);
    }

    /**
     * Send bulk SMS messages
     */
    public function sendBulkSMS(Request $request): JsonResponse
    {
        $request->validate([
            'recipients' => 'required|array|min:1',
            'recipients.*' => 'required|string',
            'message' => 'required|string',
            'from' => 'nullable|string'
        ]);

        $result = $this->twilioService->sendBulkSMS(
            $request->recipients,
            $request->message,
            $request->from
        );

        return response()->json($result);
    }

    /**
     * Send SMS with delivery status callback
     */
    public function sendSMSWithCallback(Request $request): JsonResponse
    {
        $request->validate([
            'to' => 'required|string',
            'message' => 'required|string',
            'callback_url' => 'required|url',
            'from' => 'nullable|string'
        ]);

        $result = $this->twilioService->sendSMSWithCallback(
            $request->to,
            $request->message,
            $request->callback_url,
            $request->from
        );

        return response()->json($result, $result['success'] ? 200 : 400);
    }

    /**
     * Schedule a message to be sent later
     */
    public function scheduleMessage(Request $request): JsonResponse
    {
        $request->validate([
            'to' => 'required|string',
            'message' => 'required|string',
            'send_at' => 'required|date|after:now',
            'from' => 'nullable|string'
        ]);

        try {
            $sendAt = new \DateTime($request->send_at);
            $result = $this->twilioService->scheduleMessage(
                $request->to,
                $request->message,
                $sendAt,
                $request->from
            );

            return response()->json($result, $result['success'] ? 200 : 400);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Invalid date format: ' . $e->getMessage()
            ], 400);
        }
    }

    /**
     * Get message status and details
     */
    public function getMessageStatus(Request $request): JsonResponse
    {
        $request->validate([
            'message_sid' => 'required|string'
        ]);

        $result = $this->twilioService->getMessageStatus($request->message_sid);

        return response()->json($result, $result['success'] ? 200 : 400);
    }

    /**
     * Send SMS with smart encoding (automatically handles long messages)
     */
    public function sendSmartSMS(Request $request): JsonResponse
    {
        $request->validate([
            'to' => 'required|string',
            'message' => 'required|string',
            'from' => 'nullable|string'
        ]);

        $result = $this->twilioService->sendSmartSMS(
            $request->to,
            $request->message,
            $request->from
        );

        return response()->json($result, $result['success'] ? 200 : 400);
    }

    /**
     * Validate phone number
     */
    public function validatePhoneNumber(Request $request): JsonResponse
    {
        $request->validate([
            'phone_number' => 'required|string'
        ]);

        $result = $this->twilioService->validatePhoneNumber($request->phone_number);

        return response()->json($result, $result['success'] ? 200 : 400);
    }
}

