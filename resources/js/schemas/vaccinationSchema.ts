import { z } from 'zod';

export const vaccinationSchema = z.object({
    vaccine_id: z.string().min(1, 'common.vaccine_required'),
    vaccination_date: z.string().min(1, 'common.vaccination_date_required'),
    next_due_date: z.string().optional(),
});

export type VaccinationFormValues = z.infer<typeof vaccinationSchema>;

