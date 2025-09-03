import { z } from 'zod';

export const categoryProductFormSchema = z.object({
  name: z.string()
    .min(1, 'validation.category_name_required')
    .min(2, 'validation.category_name_min_length')
    .max(100, 'validation.category_name_max_length')
    .regex(/^[a-zA-ZÀ-ÿ\s\-']+$/, 'validation.category_name_invalid_chars'),
  description: z.string()
    .max(500, 'validation.description_max_length')
    .optional()
    .or(z.literal('')),
  category_product_id: z.number()
    .int('validation.parent_category_invalid')
    .positive('validation.parent_category_invalid')
    .optional()
    .nullable(),
});

export const categoryProductSearchSchema = z.object({
  search: z.string()
    .max(255, 'validation.search_max_length')
    .optional(),
  per_page: z.number()
    .int('validation.per_page_invalid')
    .min(5, 'validation.per_page_min')
    .max(100, 'validation.per_page_max')
    .default(15),
  sort_by: z.enum(['name', 'created_at', 'updated_at'])
    .default('created_at'),
  sort_direction: z.enum(['asc', 'desc'])
    .default('desc'),
});

export const categoryProductBulkDeleteSchema = z.object({
  uuids: z.array(z.string().uuid('validation.invalid_uuid'))
    .min(1, 'validation.no_items_selected')
    .max(50, 'validation.too_many_items_selected'),
});

export type CategoryProductFormData = z.infer<typeof categoryProductFormSchema>;
export type CategoryProductSearchData = z.infer<typeof categoryProductSearchSchema>;
export type CategoryProductBulkDeleteData = z.infer<typeof categoryProductBulkDeleteSchema>;
