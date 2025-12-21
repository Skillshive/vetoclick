import { z } from 'zod';

export const appointmentSchema = z.object({
  appointment_type: z.string().min(1, 'validation.appointment_type_required'),
  appointment_date: z.string().min(1, 'validation.appointment_date_required'),
  start_time: z.string().min(1, 'validation.start_time_required'),
  is_video_conseil: z.boolean(),
  reason_for_visit: z.string().optional(),
  appointment_notes: z.string().optional(),
  veterinary_id: z.string().min(1, 'validation.vet_required'),
  pet_id: z.string().optional(), 
  client_id: z.string().min(1, 'validation.client_id_required'),
});

export type AppointmentFormValues = z.infer<typeof appointmentSchema>;
