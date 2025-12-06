import { z } from 'zod';

export const petSchema = z.object({
  name: z.string()
    .min(1, 'common.pet_name_required')
    .max(255, 'common.pet_name_too_long'),
  
  species_id: z.string()
    .min(1, 'common.species_required'),
  
  breed_id: z.string()
    .min(1, 'common.breed_required'),
  
  sex: z.enum(['0', '1'], {
    errorMap: () => ({ message: 'common.gender_required' })
  }),
  
  dob: z.string()
    .optional()
    .or(z.literal('')),
  
  weight_kg: z.string()
    .optional()
    .or(z.literal('')),
  
  color: z.string()
    .max(255, 'common.color_too_long')
    .optional()
    .or(z.literal('')),
});

export type PetFormData = z.infer<typeof petSchema>;
