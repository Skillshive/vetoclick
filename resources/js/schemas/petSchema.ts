import { z } from 'zod';

export const petFormSchema = z.object({
  client_id: z.string().optional(),
  name: z.string()
    .min(1, 'validation.name_required')
    .min(2, 'validation.name_min_length')
    .max(100, 'validation.name_max_length'),
  breed_id: z.string()
    .min(1, 'validation.breed_id_required'),
  species_id: z.string()
    .min(1, 'validation.species_id_required'),
  sex: z.union([z.literal(0), z.literal(1), z.string()])
    .transform((val) => {
      if (typeof val === 'string') {
        return val === '1' || val === 'male' ? 1 : 0;
      }
      return val;
    })
    .refine((val) => val === 0 || val === 1, {
      message: 'validation.sex_required',
    }),
  neutered_status: z.union([z.boolean(), z.string(), z.number()])
    .transform((val) => {
      if (typeof val === 'string') {
        return val === 'true' || val === '1';
      }
      if (typeof val === 'number') {
        return val === 1;
      }
      return val;
    })
    .optional()
    .default(false),
  dob: z.string()
    .min(1, 'validation.dob_required'),
  microchip_ref: z.string().max(50, 'validation.microchip_max_length').nullable().optional(),
  profile_img: z.instanceof(File).optional().nullable(),
  weight_kg: z.union([z.number(), z.string()])
    .transform((val) => {
      if (typeof val === 'string' && val.trim() !== '') {
        const parsed = parseFloat(val);
        return isNaN(parsed) ? null : parsed;
      }
      return val === '' ? null : val;
    })
    .nullable()
    .optional(),
  bcs: z.union([z.number(), z.string()])
    .transform((val) => {
      if (typeof val === 'string' && val.trim() !== '') {
        const parsed = parseInt(val, 10);
        return isNaN(parsed) ? null : parsed;
      }
      return val === '' ? null : val;
    })
    .nullable()
    .optional()
    .refine((val) => {
      if (val === null || val === undefined) return true;
      const numVal = typeof val === 'string' ? parseInt(val, 10) : val;
      return !isNaN(numVal) && numVal >= 1 && numVal <= 9;
    }, {
      message: 'validation.bcs_range',
    }),
  color: z.string().max(50, 'validation.color_max_length').nullable().optional(),
  notes: z.string().nullable().optional(),
  deceased_at: z.string().nullable().optional(),
});

export type PetFormValues = z.infer<typeof petFormSchema>;

