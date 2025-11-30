import { z } from 'zod';

export const vetAppointmentSchema = z.object({
  appointment_date: z.string().min(1, 'common.vet_dashboard.form.errors.date_required'),
  client_id: z.string().min(1, 'common.vet_dashboard.form.errors.client_required'),
  pet_id: z.string().nullable().optional(),
  appointment_type: z.string().min(1, 'common.vet_dashboard.form.errors.appointment_type_required'),
  start_time: z.string().optional(),
  is_video_conseil: z.boolean().optional(),
  reason_for_visit: z.string().optional(),
  appointment_notes: z.string().optional(),
});

export type VetAppointmentFormValues = z.infer<typeof vetAppointmentSchema>;

