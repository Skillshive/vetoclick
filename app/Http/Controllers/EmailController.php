<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Services\EmailService;

class EmailController extends Controller
{
    protected EmailService $emailService;

    public function __construct(EmailService $emailService)
    {
        $this->emailService = $emailService;
    }

    public function sendEmail(Request $request): JsonResponse
    {
        $request->validate([
            'to' => 'required|email',
            'subject' => 'required|string',
            'body' => 'required|string',
            'from' => 'nullable|email',
            'is_html' => 'boolean',
            'cc' => 'nullable|array',
            'cc.*' => 'email',
            'bcc' => 'nullable|array',
            'bcc.*' => 'email',
            'reply_to' => 'nullable|email',
            'priority' => 'nullable|integer|min:1|max:5',
            'delay' => 'nullable|integer|min:0'
        ]);
        
        $options = [];
        if ($request->has('is_html')) $options['is_html'] = $request->is_html;
        if ($request->has('cc')) $options['cc'] = $request->cc;
        if ($request->has('bcc')) $options['bcc'] = $request->bcc;
        if ($request->has('reply_to')) $options['reply_to'] = $request->reply_to;
        if ($request->has('priority')) $options['priority'] = $request->priority;
        
        $result = $this->emailService->sendEmail(
            $request->to,
            $request->subject,
            $request->body,
            $request->from,
            $options,
            $request->delay
        );
        
        return response()->json($result);
    }

    public function sendTemplateEmail(Request $request): JsonResponse
    {
        $request->validate([
            'to' => 'required|email',
            'subject' => 'required|string',
            'template' => 'required|string',
            'data' => 'nullable|array',
            'from' => 'nullable|email',
            'delay' => 'nullable|integer|min:0'
        ]);
        
        $result = $this->emailService->sendTemplateEmail(
            $request->to,
            $request->subject,
            $request->template,
            $request->data ?? [],
            $request->from,
            [],
            $request->delay
        );
        
        return response()->json($result);
    }

    public function sendBulkEmails(Request $request): JsonResponse
    {
        $request->validate([
            'recipients' => 'required|array',
            'recipients.*' => 'required|string',
            'subject' => 'required|string',
            'body' => 'required|string',
            'from' => 'nullable|email',
            'delay_ms' => 'nullable|integer|min:0'
        ]);
        
        $options = [];
        if ($request->has('delay_ms')) $options['delay_ms'] = $request->delay_ms;
        
        $result = $this->emailService->sendBulkEmails(
            $request->recipients,
            $request->subject,
            $request->body,
            $request->from,
            $options
        );
        
        return response()->json($result);
    }

    public function validateEmail(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|string'
        ]);
        
        $result = [
            'email' => $request->email,
            'is_valid' => $this->emailService->isValidEmail($request->email)
        ];
        
        return response()->json($result);
    }

    public function validateBulkEmails(Request $request): JsonResponse
    {
        $request->validate([
            'emails' => 'required|array',
            'emails.*' => 'required|string'
        ]);
        
        $result = $this->emailService->validateEmails($request->emails);
        
        return response()->json($result);
    }
}
