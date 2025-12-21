import { createSafeContext } from "@/utils/createSafeContext";
import { Dispatch } from "react";

export interface StepStatus {
  isDone: boolean;
  hasErrors?: boolean;
}

export type StepKey =
  | "personalInfo"
  | "petInfo"
  | "appointmentDetails";

export interface PersonalInfoType {
  firstname: string;
  lastname: string;
  email: string; // Keep as string but can be empty
  phone: string; // Keep as string but can be empty
  address?: string;
  city?: string;
  postal_code?: string;
}

export interface PetInfoType {
  name: string;
  breed_id: string;
  species_id?: string;
  sex: number;
  neutered_status: number;
  dob: string;
  microchip_ref?: string;
  weight_kg?: number;
  bcs?: number;
  color?: string;
  notes?: string;
  profile_img?: File | null;
  previewImage?: string | null;
  pet_id?: string; // For existing pet selection
}

export interface AppointmentDetailsType {
  veterinary_id: string;
  appointment_type: string;
  appointment_date: string;
  start_time: string;
  is_video_conseil: boolean;
  reason_for_visit?: string;
  appointment_notes?: string;
}

export interface FormState {
  readonly formData: {
    personalInfo: PersonalInfoType;
    petInfo: PetInfoType;
    appointmentDetails: AppointmentDetailsType;
  };
  readonly stepStatus: {
    [key in StepKey]: StepStatus;
  };
}

export type FormAction =
  | { type: "SET_FORM_DATA"; payload: Partial<FormState["formData"]> }
  | { type: "SET_STEP_STATUS"; payload: Partial<FormState["stepStatus"]> }
  | { type: "SET_STEP_ERRORS"; payload: { [key in StepKey]?: boolean } };

export interface UserPet {
  uuid: string;
  name: string;
  breed_id: string; // UUID string
  species_id?: string; // UUID string (optional)
  breed_name?: string;
  species_name?: string;
  sex: number;
  neutered_status: number;
  dob: string;
  microchip_ref?: string;
  weight_kg?: number;
  bcs?: number;
  color?: string;
  notes?: string;
  profile_img?: string;
}

export interface AppointmentFormContextType {
  state: FormState;
  dispatch: Dispatch<FormAction>;
  veterinarians: Array<{ id: number; uuid: string; name: string; clinic: string }>;
  selectedVetId?: string;
  clientId?: string;
  setClientId?: (clientId: string) => void;
  userPets?: UserPet[];
}

export const [AppointmentFormContextProvider, useAppointmentFormContext] =
  createSafeContext<AppointmentFormContextType>(
    "useAppointmentFormContext must be used within an AppointmentFormContextProvider",
  );

