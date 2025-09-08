import { z } from 'zod';

export const categoryBlogFormSchema = z.object({
  name: z.string()
    .min(1, 'validation.category_name_required')
    .min(2, 'validation.category_name_min_length')
    .max(100, 'validation.category_name_max_length')
    .regex(/^[a-zA-ZÀ-ÿ\s\-']+$/, 'validation.category_name_invalid_chars'),
  description: z.string()
    .max(500, 'validation.description_max_length')
    .optional()
    .or(z.literal('')),
  parent_category_id: z.string()
    .uuid('validation.parent_category_invalid')
    .optional()
    .nullable(),
});

export type CategoryBlogFormData = z.infer<typeof categoryBlogFormSchema>;
