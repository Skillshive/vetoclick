// Import Dependencies
import { useReducer, useEffect } from "react";

// Local Imports
import {
  FormAction,
  FormState,
  SubscriptionPlanFormContextProvider,
} from "./SubscriptionPlanFormContext";

// ----------------------------------------------------------------------

const initialState: FormState = {
  formData: {
    basicInfo: {
      name_en: "",
      name_ar: "",
      name_fr: "",
      description_en: "",
      description_ar: "",
      description_fr: "",
      is_active: true,
      is_popular: false,
      sort_order: 0,
    },
    pricing: {
      price: 0,
      yearly_price: 0,
    },
      features: {
        selected_features: [],
      },
    limits: {
      max_clients: undefined,
      max_pets: undefined,
      max_appointments: undefined,
    },
  },
  stepStatus: {
    basicInfo: {
      isDone: false,
    },
    pricing: {
      isDone: false,
    },
    features: {
      isDone: false,
    },
    limits: {
      isDone: false,
    },
  },
};

const reducer = (state: FormState, action: FormAction) => {
  switch (action.type) {
    case "SET_FORM_DATA":
      console.log('Reducer - SET_FORM_DATA action:', action);
      console.log('Reducer - Current state:', state);
      const newState = {
        ...state,
        formData: {
          ...state.formData,
          ...action.payload,
        },
      };
      console.log('Reducer - New state:', newState);
      return newState;
    case "SET_STEP_STATUS":
      return {
        ...state,
        stepStatus: {
          ...state.stepStatus,
          ...action.payload,
        },
      };
    case "RESET_FORM":
      return initialState;
    default:
      return state;
  }
};

interface SubscriptionPlanFormProviderProps {
  children: React.ReactNode;
  plan?: any;
}

export function SubscriptionPlanFormProvider({ children, plan }: SubscriptionPlanFormProviderProps) {
  // Initialize form data with plan data if editing
  console.log('SubscriptionPlanFormProvider - plan data:', plan);
  const planData = plan?.data || plan; // Handle both nested and direct plan data
  const initialData = plan ? {
    formData: {
      basicInfo: {
        name_en: planData.name?.en || '',
        name_ar: planData.name?.ar || '',
        name_fr: planData.name?.fr || '',
        description_en: planData.description?.en || '',
        description_ar: planData.description?.ar || '',
        description_fr: planData.description?.fr || '',
        is_active: planData.is_active || true,
        is_popular: planData.is_popular || false,
        sort_order: planData.sort_order || 0,
      },
      pricing: {
        price: parseFloat(planData.price) || 0,
        yearly_price: parseFloat(planData.yearly_price) || 0,
      },
      features: {
        selected_features: planData.features?.map((f: any) => f.uuid) || [],
      },
      limits: {
        max_clients: planData.max_clients,
        max_pets: planData.max_pets,
        max_appointments: planData.max_appointments,
      },
    },
    stepStatus: {
      basicInfo: { isDone: false },
      pricing: { isDone: false },
      features: { isDone: false },
      limits: { isDone: false },
    },
  } : initialState;

  const [state, dispatch] = useReducer(reducer, initialData);
  console.log('SubscriptionPlanFormProvider - initial state:', state);
  
  // Update form data when plan changes
  useEffect(() => {
    if (plan) {
      const planData = plan?.data || plan; // Handle both nested and direct plan data
      console.log('Plan changed, updating form data:', planData);
      dispatch({
        type: "SET_FORM_DATA",
        payload: {
          basicInfo: {
            name_en: planData.name?.en || '',
            name_ar: planData.name?.ar || '',
            name_fr: planData.name?.fr || '',
            description_en: planData.description?.en || '',
            description_ar: planData.description?.ar || '',
            description_fr: planData.description?.fr || '',
            is_active: planData.is_active || true,
            is_popular: planData.is_popular || false,
            sort_order: planData.sort_order || 0,
          },
          pricing: {
            price: parseFloat(planData.price) || 0,
            yearly_price: parseFloat(planData.yearly_price) || 0,
          },
          features: {
            selected_features: planData.features?.map((f: any) => f.uuid) || [],
          },
          limits: {
            max_clients: planData.max_clients,
            max_pets: planData.max_pets,
            max_appointments: planData.max_appointments,
          },
        },
      });
    }
  }, [plan]);
  
  const value = { state, dispatch };
  return (
    <SubscriptionPlanFormContextProvider value={value}>
      {children}
    </SubscriptionPlanFormContextProvider>
  );
}
