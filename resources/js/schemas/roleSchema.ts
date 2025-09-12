import { z } from 'zod';

export const roleFormSchema = z.object({
    name: z.string()
        .min(1, 'role_name_required')
        .max(255, 'role_name_too_long'),
    description: z.string()
        .max(500, 'description_too_long')
        .optional(),
    permissions: z.array(z.string())
        .optional(),
});
