import { z } from 'zod';

const numericField = (key: string, options?: { min?: number }) =>
  z.coerce.number({
    invalid_type_error: key,
  })
    .refine((value) => !Number.isNaN(value), { message: key })
    .refine((value) => options?.min === undefined || value >= options.min, {
      message: key,
    });

export const orderFormSchema = z.object({
  reference: z
    .string()
    .max(50, 'validation.order_reference_max')
    .optional()
    .or(z.literal('')),
  supplier_id: numericField('validation.order_supplier_required', { min: 1 }),
  order_type: numericField('validation.order_type_required', { min: 1 }),
  status: numericField('validation.order_status_required', { min: 1 }),
  subtotal: numericField('validation.order_subtotal_invalid', { min: 0 }),
  tax_amount: numericField('validation.order_tax_invalid', { min: 0 }),
  shipping_cost: numericField('validation.order_shipping_invalid', { min: 0 }),
  discount_amount: numericField('validation.order_discount_invalid', { min: 0 }),
  total_amount: numericField('validation.order_total_invalid', { min: 0 }),
  discount_percentage: z
    .union([
      numericField('validation.order_discount_percentage_invalid'),
      z.literal('').transform(() => undefined),
    ])
    .optional()
    .refine(
      (value) => value === undefined || (value >= 0 && value <= 100),
      'validation.order_discount_percentage_range',
    ),
  payment_due_date: z
    .string()
    .optional()
    .or(z.literal(''))
    .transform((value) => (value === '' ? undefined : value)),
  payment_method: numericField('validation.order_payment_method_required', {
    min: 1,
  }),
  order_date: z
    .string()
    .min(1, 'validation.order_date_required'),
  confirmed_delivery_date: z
    .string()
    .optional()
    .or(z.literal(''))
    .transform((value) => (value === '' ? undefined : value)),
  approved: z.boolean().optional(),
  approved_at: z
    .string()
    .optional()
    .or(z.literal(''))
    .transform((value) => (value === '' ? undefined : value)),
  received_at: z
    .string()
    .optional()
    .or(z.literal(''))
    .transform((value) => (value === '' ? undefined : value)),
  received_by: z
    .union([
      numericField('validation.order_received_by_invalid'),
      z.literal('').transform(() => undefined),
    ])
    .optional(),
  receiving_notes: z
    .string()
    .optional()
    .or(z.literal(''))
    .transform((value) => (value === '' ? undefined : value)),
  cancellation_reason: z
    .string()
    .optional()
    .or(z.literal(''))
    .transform((value) => (value === '' ? undefined : value)),
  cancelled_by: z
    .union([
      numericField('validation.order_cancelled_by_invalid'),
      z.literal('').transform(() => undefined),
    ])
    .optional(),
  cancelled_at: z
    .string()
    .optional()
    .or(z.literal(''))
    .transform((value) => (value === '' ? undefined : value)),
  return_reason: z
    .string()
    .optional()
    .or(z.literal(''))
    .transform((value) => (value === '' ? undefined : value)),
  returned_at: z
    .string()
    .optional()
    .or(z.literal(''))
    .transform((value) => (value === '' ? undefined : value)),
});

export type OrderFormSchema = z.infer<typeof orderFormSchema>;

