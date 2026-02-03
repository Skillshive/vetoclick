// Import Dependencies
import { useReducer, useEffect, useState } from "react";

// Local Imports
import {
  FormAction,
  FormState,
  AppointmentFormContextProvider,
  StepKey,
} from "./AppointmentFormContext";

// ----------------------------------------------------------------------

const initialState: FormState = {
  formData: {
    personalInfo: {
      firstname: "",
      lastname: "",
      email: "", // Keep as empty string for compatibility
      phone: "", // Keep as empty string for compatibility
      address: "",
      city: "",
      postal_code: "",
    },
    petInfo: {
      name: "",
      breed_id: "",
      species_id: "",
      sex: 0,
      neutered_status: 0,
      approximate_age: "",
      microchip_ref: "",
      weight_kg: undefined,
      bcs: undefined,
      color: "",
      notes: "",
      profile_img: null,
      previewImage: null,
      pet_id: "",
    },
    appointmentDetails: {
      veterinary_id: "",
      appointment_type: "",
      appointment_date: "",
      start_time: "",
      is_video_conseil: false,
      reason_for_visit: "",
      appointment_notes: "",
    },
  },
  stepStatus: {
    personalInfo: {
      isDone: false,
    },
    petInfo: {
      isDone: false,
    },
    appointmentDetails: {
      isDone: false,
    },
  },
};

const reducer = (state: FormState, action: FormAction) => {
  switch (action.type) {
    case "SET_FORM_DATA":
      return {
        ...state,
        formData: {
          ...state.formData,
          ...action.payload,
        },
      };
    case "SET_STEP_STATUS":
      return {
        ...state,
        stepStatus: {
          ...state.stepStatus,
          ...action.payload,
        },
      };
    case "SET_STEP_ERRORS":
      return {
        ...state,
        stepStatus: {
          ...state.stepStatus,
          ...Object.keys(action.payload).reduce((acc, key) => {
            acc[key as StepKey] = {
              ...state.stepStatus[key as StepKey],
              hasErrors: action.payload[key as StepKey] ?? false,
            };
            return acc;
          }, {} as FormState["stepStatus"]),
        },
      };
    default:
      return state;
  }
};

interface UserPet {
  uuid: string;
  name: string;
  breed_id: string;
  species_id?: string;
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

interface UserPersonalInfo {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  postal_code?: string;
}

interface AppointmentFormProviderProps {
  children: React.ReactNode;
  veterinarians: Array<{ id: number; uuid: string; name: string; clinic: string }>;
  selectedVetId?: string;
  clientId?: string;
  userPersonalInfo?: UserPersonalInfo;
  userPets?: UserPet[];
  minDate?: string;
}

export function AppointmentFormProvider({
  children,
  veterinarians,
  selectedVetId,
  clientId: initialClientId,
  userPersonalInfo,
  userPets = [],
  minDate,
}: AppointmentFormProviderProps) {
  // Initialize state with user data if available
  const getInitialState = (): FormState => {
    const state = { ...initialState };
    
    // Pre-fill personal info if user is logged in
    if (userPersonalInfo) {
      state.formData.personalInfo = {
        firstname: userPersonalInfo.firstname || "",
        lastname: userPersonalInfo.lastname || "",
        email: userPersonalInfo.email || "", 
        phone: userPersonalInfo.phone || "", 
        address: userPersonalInfo.address || "",
        city: userPersonalInfo.city || "",
        postal_code: userPersonalInfo.postal_code || "",
      };
      // Mark personalInfo step as done
      state.stepStatus.personalInfo = {
        isDone: true,
        hasErrors: false,
      };
    }
    
    return state;
  };

  const [state, dispatch] = useReducer(reducer, getInitialState());
  const [clientId, setClientId] = useState<string | undefined>(initialClientId);

  // Set selected veterinarian if provided
  useEffect(() => {
    if (selectedVetId) {
      dispatch({
        type: "SET_FORM_DATA",
        payload: {
          appointmentDetails: {
            ...initialState.formData.appointmentDetails,
            veterinary_id: selectedVetId,
          },
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVetId]);

  // Set clientId in personalInfo if provided
  useEffect(() => {
    if (clientId) {
      // Client already exists, we can skip personal info step or pre-fill if needed
    }
  }, [clientId]);

  return (
    <AppointmentFormContextProvider
      value={{
        state,
        dispatch,
        veterinarians,
        selectedVetId,
        clientId,
        setClientId,
        userPets,
        minDate,
      }}
    >
      {children}
    </AppointmentFormContextProvider>
  );
}

