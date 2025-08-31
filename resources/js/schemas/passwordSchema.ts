import { z } from 'zod';

export const passwordFormSchema = z.object({
  current_password: z.string()
    .min(1, 'validation.current_password_required'),
  password: z.string()
    .min(8, 'validation.password_min_length')
    .regex(/[A-Z]/, 'validation.password_uppercase_required')
    .regex(/[a-z]/, 'validation.password_lowercase_required')
    .regex(/[0-9]/, 'validation.password_number_required')
    .regex(/[^A-Za-z0-9]/, 'validation.password_special_char_required'),
  password_confirmation: z.string(),
}).refine((data) => data.password === data.password_confirmation, {
  message: 'validation.password_confirmation_mismatch',
  path: ['password_confirmation'],
});

export type PasswordFormData = z.infer<typeof passwordFormSchema>;