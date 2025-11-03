import { z } from "zod";

// Declare a global 'trans' function for translation.
// This is a placeholder and assumes 'trans' is globally available at runtime.
declare const trans: (key: string, replacements?: Record<string, string>) => string;

export const loginSchema = z.object({
  email: z.string().min(1, trans('validation.required', { attribute: trans('validation.attributes.email') })).email(trans('validation.email', { attribute: trans('validation.attributes.email') })),
  password: z
    .string()
    .min(8, trans('validation.min.string', { attribute: trans('validation.attributes.password'), min: '8' }))
    .regex(/[A-Z]/, trans('validation.password_uppercase_required'))
    .regex(/[a-z]/, trans('validation.password_lowercase_required'))
    .regex(/[0-9]/, trans('validation.password_number_required'))
    .regex(/[^A-Za-z0-9]/, trans('validation.password_special_char_required')),
});
