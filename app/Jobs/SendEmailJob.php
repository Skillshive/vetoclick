<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\View;
use Illuminate\Mail\Message;
use Exception;

class SendEmailJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected array $emailData;

    public function __construct(array $emailData)
    {
        $this->emailData = $emailData;
    }

    public function handle(): void
    {
        try {
            $to = $this->emailData['to'];
            $subject = $this->emailData['subject'];
            $body = $this->emailData['body'];
            $from = $this->emailData['from'] ?? config('mail.from.address');
            $options = $this->emailData['options'] ?? [];

            $fromName = $options['from_name'] ?? config('mail.from.name');
            $recipients = is_array($to) ? $to : [$to];

            Mail::send([], [], function (Message $message) use ($recipients, $subject, $body, $from, $fromName, $options) {
                $message->to($recipients)
                       ->subject($subject)
                       ->from($from, $fromName);

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

            Log::info("Queued email sent successfully", [
                'recipients' => $recipients,
                'subject' => $subject,
                'job_id' => $this->job->getJobId()
            ]);

        } catch (Exception $e) {
            Log::error('Queued email sending failed: ' . $e->getMessage(), [
                'email_data' => $this->emailData,
                'job_id' => $this->job->getJobId()
            ]);
            throw $e;
        }
    }

    public function failed(Exception $exception): void
    {
        Log::error('SendEmailJob failed permanently', [
            'email_data' => $this->emailData,
            'error' => $exception->getMessage(),
            'job_id' => $this->job->getJobId()
        ]);
    }
}
