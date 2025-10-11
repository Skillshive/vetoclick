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

export const blogFormSchema = z.object({
  title: z.string()
    .min(1, 'validation.blog_title_required')
    .min(2, 'validation.blog_title_min_length')
    .max(255, 'validation.blog_title_max_length'),

  body: z.string()
    .min(1, 'validation.blog_body_required'),

  caption: z.string()
    .min(1, 'validation.blog_caption_required')
    .max(255, 'validation.blog_caption_max_length'),


  meta_title: z.string()
    .min(1, 'validation.meta_title_required')
    .max(255, 'validation.meta_title_max_length'),

  meta_desc: z.string()
    .min(1, 'validation.meta_desc_required')
    .max(1000, 'validation.meta_desc_max_length'),

  meta_keywords: z.string()
    .optional()
    .or(z.literal('')),

  category_blog_id: z.string()
    .min(1, 'validation.category_required'),

  tags: z.string()
    .optional()
    .or(z.literal('')),
});

export type BlogFormData = z.infer<typeof blogFormSchema>;
export type CategoryBlogFormData = z.infer<typeof categoryBlogFormSchema>;
