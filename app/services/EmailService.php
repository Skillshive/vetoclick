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
        array $options = []
    ): array {
        try {
            $fromEmail = $from ?? config('mail.from.address');
            $fromName = $options['from_name'] ?? config('mail.from.name');
            
            $recipients = is_array($to) ? $to : [$to];
            
            foreach ($recipients as $email) {
                if (!$this->isValidEmail($email)) {
                    throw new Exception("Invalid email address: {$email}");
                }
            }

            Mail::send([], [], function (Message $message) use ($recipients, $subject, $body, $fromEmail, $fromName, $options) {
                $message->to($recipients)
                       ->subject($subject)
                       ->from($fromEmail, $fromName);

                if ($options['is_html'] ?? true) {
                    $message->html($body);
                } else {
                    $message->text($body);
                }

                if (!empty($options['cc'])) {
                    $message->cc($options['cc']);
                }

                if (!empty($options['bcc'])) {
                    $message->bcc($options['bcc']);
                }

                if (!empty($options['reply_to'])) {
                    $message->replyTo($options['reply_to']);
                }

                if (!empty($options['attachments'])) {
                    foreach ($options['attachments'] as $attachment) {
                        if (is_array($attachment)) {
                            $message->attach($attachment['path'], [
                                'as' => $attachment['name'] ?? null,
                                'mime' => $attachment['mime'] ?? null
                            ]);
                        } else {
                            $message->attach($attachment);
                        }
                    }
                }

                if (!empty($options['priority'])) {
                    $message->priority($options['priority']);
                }
            });

            $this->logEmailActivity('sent', $recipients, $subject);

            return [
                'success' => true,
                'message' => 'Email sent successfully',
                'recipients' => $recipients,
                'provider' => $this->defaultProvider
            ];

        } catch (Exception $e) {
            Log::error('Email sending failed: ' . $e->getMessage());
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
        array $options = []
    ): array {
        try {
            if (!View::exists($template)) {
                throw new Exception("Email template '{$template}' not found");
            }

            $body = View::make($template, $data)->render();
            $options['is_html'] = true;

            return $this->sendEmail($to, $subject, $body, $from, $options);

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

        foreach ($recipients as $recipient) {
            $recipientEmail = is_array($recipient) ? $recipient['email'] : $recipient;
            $recipientData = is_array($recipient) ? $recipient : [];
            
            $personalizedSubject = $this->replacePlaceholders($subject, $recipientData);
            $personalizedBody = $this->replacePlaceholders($body, $recipientData);

            $result = $this->sendEmail($recipientEmail, $personalizedSubject, $personalizedBody, $from, $options);
            
            $results[] = [
                'recipient' => $recipientEmail,
                'result' => $result
            ];

            if ($result['success']) {
                $successCount++;
            } else {
                $failureCount++;
            }

            if (!empty($options['delay_ms'])) {
                usleep($options['delay_ms'] * 1000);
            }
        }

        return [
            'total_sent' => count($recipients),
            'success_count' => $successCount,
            'failure_count' => $failureCount,
            'results' => $results
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