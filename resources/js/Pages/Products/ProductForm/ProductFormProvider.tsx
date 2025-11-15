// Import Dependencies
import { useReducer, useEffect, useState } from "react";

// Local Imports
import {
  FormAction,
  FormState,
  ProductFormContextProvider,
  StepKey,
} from "./ProductFormContext";
import { Product, Category } from "../datatable/types";

// ----------------------------------------------------------------------

const initialState: FormState = {
  formData: {
    basicInfo: {
      name: "",
      sku: "",
      brand: "",
      description: "",
      barcode: "",
      image: null,
      previewImage: null,
    },
    categoryType: {
      category_product_id: "",
      type: 1,
    },
    medicalDetails: {
      dosage_form: "",
      administration_route: "",
      target_species: [],
    },
    vaccineInfo: {
      manufacturer: "",
      batch_number: "",
      expiry_date: "",
      dosage_ml: null,
      vaccine_instructions: "",
    },
    stockStatus: {
      minimum_stock_level: 0,
      maximum_stock_level: 0,
      availability_status: 1,
      prescription_required: false,
      is_active: true,
      notes: "",
    },
    vaccinationSchedules: [],
  },
  stepStatus: {
    basicInfo: {
      isDone: false,
    },
    categoryType: {
      isDone: false,
    },
    medicalDetails: {
      isDone: false,
    },
    vaccineInfo: {
      isDone: false,
    },
    stockStatus: {
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
        stepStatus: Object.keys(state.stepStatus).reduce((acc, key) => {
          const stepKey = key as StepKey;
          acc[stepKey] = {
            ...state.stepStatus[stepKey],
            hasErrors: action.payload[stepKey] ?? state.stepStatus[stepKey].hasErrors ?? false,
          };
          return acc;
        }, {} as FormState["stepStatus"]),
      };
    default:
      return state;
  }
};

interface ProductFormProviderProps {
  children: React.ReactNode;
  product?: Product;
  categories?: Category[];
}

export function ProductFormProvider({ children, product, categories = [] }: ProductFormProviderProps) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const isEditing = !!(product as any)?.data;
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize form data when editing
  useEffect(() => {
    if ((product as any)?.data && !isInitialized) {
      const productData = (product as any).data;
      console.log('productData', productData);
      
      dispatch({
        type: "SET_FORM_DATA",
        payload: {
          basicInfo: {
            name: productData.name || "",
            sku: productData.sku || "",
            brand: productData.brand || "",
            description: productData.description || "",
            barcode: productData.barcode || "",
            image: null, // Will be set by the form if user uploads a new image
            previewImage: productData.image ? `/storage/${productData.image}` : null,
          },
          categoryType: {
            category_product_id: productData.category?.id?.toString() || "",
            type: productData.type || 1,
          },
          medicalDetails: {
            dosage_form: productData.dosage_form || "",
            administration_route: productData.administration_route || "",
            target_species: productData.target_species || [],
          },
          vaccineInfo: {
            manufacturer: productData.manufacturer || "",
            batch_number: productData.batch_number || "",
            expiry_date: productData.expiry_date || "",
            dosage_ml: productData.dosage_ml || null,
            vaccine_instructions: productData.vaccine_instructions || "",
          },
          stockStatus: {
            minimum_stock_level: productData.minimum_stock_level || 0,
            maximum_stock_level: productData.maximum_stock_level || 0,
            availability_status: productData.availability_status || 1,
            prescription_required: productData.prescription_required || false,
            is_active: productData.is_active ?? true,
            notes: productData.notes || "",
          },
          vaccinationSchedules: productData.vaccination_schedules || [],
        },
      });
      
      setIsInitialized(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product]);

  const value = { state, dispatch, categories, isEditing, product };
  return (
    <ProductFormContextProvider value={value}>{children}</ProductFormContextProvider>
  );
}