import { z } from 'zod';

export const profileFormSchema = z.object({
  firstname: z.string()
    .min(1, 'validation.first_name_required')
    .min(2, 'validation.first_name_min_length')
    .max(50, 'validation.first_name_max_length')
    .regex(/^[a-zA-Z\s]+$/, 'validation.first_name_invalid_chars'),
  lastname: z.string()
    .min(1, 'validation.last_name_required')
    .min(2, 'validation.last_name_min_length')
    .max(50, 'validation.last_name_max_length')
    .regex(/^[a-zA-Z\s]+$/, 'validation.last_name_invalid_chars'),
  email: z.string()
    .min(1, 'validation.email_required')
    .email('validation.email_invalid'),
  phone: z.string()
    .optional()
    .refine((val) => !val || /^[\+]?[1-9][\d]{0,15}$/.test(val), {
      message: 'validation.phone_invalid',
    }),
  clinic_name: z.string()
    .optional(),
});

export type ProfileFormData = z.infer<typeof profileFormSchema>;