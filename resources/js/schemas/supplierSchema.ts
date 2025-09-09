import { z } from 'zod';

export const supplierSchema = z.object({
    name: z.string()
        .min(1, 'validation.name_required')
        .min(2, 'validation.name_min_length')
        .max(50, 'validation.name_max_length')
        .regex(/^[a-zA-Z\s]+$/, 'validation.name_invalid_chars'),
    email: z.union([
        z.string().email('validation.email_invalid'),
        z.literal('')
    ]),
    phone: z.string()
        .optional()
        .refine((val) => !val || /^(\+212|0)[0-9]{9}$/.test(val), {
            message: 'validation.phone_invalid',
        }),
    address: z.string()
        .max(500, 'validation.address_max_length')
        .optional()
        .or(z.literal(''))
});

export type SupplierFormValues = z.infer<typeof supplierSchema>;
