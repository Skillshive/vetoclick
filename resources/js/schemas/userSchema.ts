import { z } from 'zod';

export const userFormSchema = z.object({
  firstname: z.string()
    .min(1, 'validation.firstname_required')
    .min(2, 'validation.firstname_min_length')
    .max(100, 'validation.firstname_max_length')
    .regex(/^[a-zA-ZÀ-ÿ\s\-']+$/, 'validation.firstname_invalid_chars'),
  lastname: z.string()
    .min(1, 'validation.lastname_required')
    .min(2, 'validation.lastname_min_length')
    .max(100, 'validation.lastname_max_length')
    .regex(/^[a-zA-ZÀ-ÿ\s\-']+$/, 'validation.lastname_invalid_chars'),
  email: z.string()
    .min(1, 'validation.email_required')
    .email('validation.email_invalid'),
  phone: z.string()
    .min(1, 'validation.phone_required')
    .refine((val) => !val || /^(\+212|0)[0-9]{9}$/.test(val), {
      message: 'validation.phone_invalid',
    }),
      image: z.instanceof(File)
        .optional()
        .nullable(),
    role: z.string()
        .min(1, 'validation.role_required'),
});
export type CategoryBlogFormData = z.infer<typeof userFormSchema>;
