import { z } from 'zod';

export const petFormSchema = z.object({
  client_id: z.string().optional(),
  
  name: z.string()
    .min(1, 'common.pet_name_required')
    .max(255, 'common.pet_name_too_long'),
  
  species_id: z.string()
    .min(1, 'common.species_required'),
  
  breed_id: z.string()
    .min(1, 'common.breed_required'),
  
  sex: z.union([z.literal(0), z.literal(1)]),
  
  neutered_status: z.boolean().optional(),
  
  dob: z.string()
    .optional()
    .nullable(),
  
  microchip_ref: z.string()
    .max(50, 'common.microchip_too_long')
    .optional()
    .nullable(),
  
  profile_img: z.instanceof(File)
    .optional()
    .nullable(),
  
  weight_kg: z.union([z.string(), z.number()])
    .optional()
    .nullable()
    .transform((val) => {
      if (val === null || val === undefined || val === '') return null;
      return typeof val === 'string' ? parseFloat(val) : val;
    }),
  
  bcs: z.number()
    .min(1, 'common.bcs_min')
    .max(9, 'common.bcs_max')
    .optional()
    .nullable(),
  
  color: z.string()
    .max(255, 'common.color_too_long')
    .optional()
    .nullable(),
  
  notes: z.string()
    .optional()
    .nullable(),
  
  deceased_at: z.string()
    .optional()
    .nullable(),
});

export type PetFormValues = z.infer<typeof petFormSchema>;

// Export alias for backward compatibility
export const petSchema = petFormSchema;
export type PetFormData = PetFormValues;
