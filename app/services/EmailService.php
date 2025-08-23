<?php

namespace App\Services;

use Illuminate\Mail\Mailable;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\View;
use Illuminate\Mail\Message;
use App\Jobs\SendEmailJob;
use Exception;

class EmailService
{
    protected array $config;
    protected string $defaultProvider;
    protected array $providers;

    public function __construct()
    {
        $this->config = config('mail', []);
        $this->defaultProvider = config('mail.default', 'smtp');
        
        $this->configureSmtpFromEnv();
    }

    /**
     * Send a simple email
     */
    public function sendEmail(
        string|array $to,
        string $subject,
        string $body,
        ?string $from = null,
        array $options = [],
        ?int $delay = null
    ): array {
        try {
            $recipients = is_array($to) ? $to : [$to];
            
            foreach ($recipients as $email) {
                if (!$this->isValidEmail($email)) {
                    throw new Exception("Invalid email address: {$email}");
                }
            }

            $emailData = [
                'to' => $to,
                'subject' => $subject,
                'body' => $body,
                'from' => $from,
                'options' => $options
            ];

            $job = new SendEmailJob($emailData);
            
            if ($delay) {
                $job->delay(now()->addSeconds($delay));
            }
            
            dispatch($job);

            $this->logEmailActivity('queued', $recipients, $subject);

            return [
                'success' => true,
                'message' => 'Email queued successfully',
                'recipients' => $recipients,
                'provider' => $this->defaultProvider,
                'queued_at' => now()->toDateTimeString()
            ];

        } catch (Exception $e) {
            Log::error('Email queueing failed: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    public function sendTemplateEmail(
        string|array $to,
        string $subject,
        string $template,
        array $data = [],
        ?string $from = null,
        array $options = [],
        ?int $delay = null
    ): array {
        try {
            if (!View::exists($template)) {
                throw new Exception("Email template '{$template}' not found");
            }

            $body = View::make($template, $data)->render();
            $options['is_html'] = true;

            return $this->sendEmail($to, $subject, $body, $from, $options, $delay);

        } catch (Exception $e) {
            Log::error('Template email sending failed: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    public function sendBulkEmails(
        array $recipients,
        string $subject,
        string $body,
        ?string $from = null,
        array $options = []
    ): array {
        $results = [];
        $successCount = 0;
        $failureCount = 0;
        $delay = 0;

        foreach ($recipients as $recipient) {
            $recipientEmail = is_array($recipient) ? $recipient['email'] : $recipient;
            $recipientData = is_array($recipient) ? $recipient : [];
            
            $personalizedSubject = $this->replacePlaceholders($subject, $recipientData);
            $personalizedBody = $this->replacePlaceholders($body, $recipientData);

            if (!empty($options['delay_ms'])) {
                $delay += ($options['delay_ms'] / 1000);
            }

            $result = $this->sendEmail($recipientEmail, $personalizedSubject, $personalizedBody, $from, $options, $delay);
            
            $results[] = [
                'recipient' => $recipientEmail,
                'result' => $result
            ];

            if ($result['success']) {
                $successCount++;
            } else {
                $failureCount++;
            }
        }

        return [
            'total_queued' => count($recipients),
            'success_count' => $successCount,
            'failure_count' => $failureCount,
            'results' => $results,
            'message' => 'All emails queued for bulk sending'
        ];
    }


    public function isValidEmail(string $email): bool
    {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }

    public function validateEmails(array $emails): array
    {
        $results = [];
        foreach ($emails as $email) {
            $results[$email] = $this->isValidEmail($email);
        }
        return $results;
    }

    protected function replacePlaceholders(string $text, array $data): string
    {
        foreach ($data as $key => $value) {
            $text = str_replace('{{' . $key . '}}', $value, $text);
        }
        return $text;
    }

    protected function logEmailActivity(string $action, array $recipients, string $subject): void
    {
        Log::info("Email {$action}", [
            'recipients' => $recipients,
            'subject' => $subject,
            'provider' => $this->defaultProvider,
            'timestamp' => now()->toDateTimeString()
        ]);
    }


    protected function configureSmtpFromEnv(): void
    {
        Config::set('mail.mailers.smtp.host', env('MAIL_HOST', 'localhost'));
        Config::set('mail.mailers.smtp.port', env('MAIL_PORT', 587));
        Config::set('mail.mailers.smtp.encryption', env('MAIL_ENCRYPTION', 'tls'));
        Config::set('mail.mailers.smtp.username', env('MAIL_USERNAME'));
        Config::set('mail.mailers.smtp.password', env('MAIL_PASSWORD'));
        Config::set('mail.mailers.smtp.timeout', env('MAIL_TIMEOUT', 60));
        Config::set('mail.mailers.smtp.local_domain', env('MAIL_EHLO_DOMAIN'));
        
        Config::set('mail.from.address', env('MAIL_FROM_ADDRESS', 'noreply@example.com'));
        Config::set('mail.from.name', env('MAIL_FROM_NAME', env('APP_NAME', 'Laravel')));
        
        Config::set('mail.default', env('MAIL_MAILER', 'smtp'));
        
        Log::info('SMTP configuration loaded from environment variables');
    }
}