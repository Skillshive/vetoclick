import { z } from 'zod';

// Phone regex: international format, allows +, spaces, dashes, parentheses
const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const clientSchema = z.object({
  first_name: z.string()
    .min(2, 'validation.first_name_required')
    .max(255, 'validation.first_name_too_long'),
  
  last_name: z.string()
    .min(2, 'validation.last_name_required')
    .max(255, 'validation.last_name_too_long'),
  
  email: z.string()
  .optional()
    .refine((val) => !val || emailRegex.test(val as string), {
        message: 'validation.invalid_email',
    })
    .or(z.literal('')),
    phone: z.string()
    .min(1, 'validation.phone_required')
    .refine((val) => !val || /^(\+212|0)[0-9]{9}$/.test(val), {
        message: 'validation.phone_invalid',
    }),
  
  fixe: z.string()
    .optional()
    .refine((val) => !val || /^(\+212|0)[0-9]{9}$/.test(val), {
        message: 'validation.phone_invalid',
    }),
  
  address: z.string()
    .max(500, 'validation.address_too_long')
    .optional()
    .or(z.literal('')),
  
  city: z.string()
    .max(255, 'validation.city_too_long')
    .optional()
    .or(z.literal('')),
  
  postal_code: z.string()
    .max(20, 'validation.postal_code_too_long')
    .optional()
    .or(z.literal('')),
});

export type ClientFormData = z.infer<typeof clientSchema>;

