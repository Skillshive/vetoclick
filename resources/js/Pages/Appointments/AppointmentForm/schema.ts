import { z } from 'zod';

// Personal Info Schema
export const personalInfoSchema = z.object({
  firstname: z.string().min(1, "validation.firstname_required"),
  lastname: z.string().min(1, "validation.lastname_required"),
  email: z.string(), 
  phone: z.string(), 
  address: z.string().optional(),
  city: z.string().optional(),
  postal_code: z.string().optional(),
});

export type PersonalInfoType = z.infer<typeof personalInfoSchema>;

// Pet Info Schema
export const petInfoSchema = z.object({
  name: z.string().min(1, "validation.pet_name_required"),
  breed_id: z.string().optional(),
  species_id: z.string().optional(),
  sex: z.number().min(0).max(1),
  neutered_status: z.number().min(0).max(1),
  approximate_age: z.string().optional(),
  microchip_ref: z.string().optional(),
  weight_kg: z.number().optional(),
  bcs: z.number().optional(),
  color: z.string().optional(),
  notes: z.string().optional(),
  profile_img: z.instanceof(File).nullable().optional(),
  previewImage: z.string().nullable().optional(),
  pet_id: z.string().optional(), 
});

export type PetInfoType = z.infer<typeof petInfoSchema>;

// Appointment Details Schema
export const appointmentDetailsSchema = z.object({
  veterinary_id: z.string().min(1, "validation.veterinary_id_required"),
  appointment_type: z.string().min(1, "validation.appointment_type_required"),
  appointment_date: z.string().min(1, "validation.appointment_date_required"),
  start_time: z.string().min(1, "validation.start_time_required"),
  is_video_conseil: z.boolean(),
  reason_for_visit: z.string().optional(),
  appointment_notes: z.string().optional(),
});

export type AppointmentDetailsType = z.infer<typeof appointmentDetailsSchema>;

// Combined Schema
export const appointmentFormSchema = z.object({
  personalInfo: personalInfoSchema,
  petInfo: petInfoSchema,
  appointmentDetails: appointmentDetailsSchema,
});

export type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

