import { z } from 'zod';

export const speciesSchema = z.object({
  name: z.string()
    .min(1, 'validation.specie_name_required')
    .min(2, 'validation.specie_name_min_length')
    .max(100, 'validation.specie_name_max_length')
    .regex(/^[a-zA-ZÀ-ÿ\s\-']+$/, 'validation.specie_name_invalid_chars'),
  description: z.string()
    .max(500, 'validation.description_max_length')
    .optional()
    .or(z.literal('')),
  image: z.instanceof(File)
    .optional()
    .nullable(),
});

export const breedsSchema = z.object({
  breed_name: z.string()
    .min(1, 'validation.breed_name_required')
    .min(2, 'validation.breed_name_min_length')
    .max(100, 'validation.breed_name_max_length')
    .regex(/^[a-zA-ZÀ-ÿ\s\-']+$/, 'validation.breed_name_invalid_chars'),
  avg_weight_kg: z
    .number('validation.avg_weight_must_be_number')
    .max(100, 'validation.avg_weight_max') 
    .optional()
    .nullable(),
    life_span_years: z
    .number('validation.life_span_must_be_number')
    .int('validation.life_span_must_be_integer')
    .min(0, 'validation.life_span_positive') 
    .max(50, 'validation.life_span_max') 
    .optional()
    .nullable(),
  image: z.instanceof(File)
    .optional()
    .nullable(),
});

export const speciesSchemaSearchSchema = z.object({
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

export const speciesSchemaBulkDeleteSchema = z.object({
  uuids: z.array(z.string().uuid('validation.invalid_uuid'))
    .min(1, 'validation.no_items_selected')
    .max(50, 'validation.too_many_items_selected'),
});

export type speciesSchemaFormData = z.infer<typeof speciesSchema>;
export type speciesSchemaSearchData = z.infer<typeof speciesSchemaSearchSchema>;
export type speciesSchemaBulkDeleteData = z.infer<typeof speciesSchemaBulkDeleteSchema>;
