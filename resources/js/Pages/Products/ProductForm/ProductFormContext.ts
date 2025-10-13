import { createSafeContext } from "@/utils/createSafeContext";
import { Dispatch } from "react";
import { 
  BasicInfoType, 
  CategoryTypeType, 
  MedicalDetailsType, 
  VaccineInfoType, 
  StockStatusType,
  VaccinationScheduleType 
} from "./schema";
import { Category, Product } from "../datatable/types";

export interface StepStatus {
  isDone: boolean;
}

export type StepKey =
  | "basicInfo"
  | "categoryType"
  | "medicalDetails"
  | "vaccineInfo"
  | "stockStatus";

export interface FormState {
  readonly formData: {
    basicInfo: BasicInfoType;
    categoryType: CategoryTypeType;
    medicalDetails: MedicalDetailsType;
    vaccineInfo: VaccineInfoType;
    stockStatus: StockStatusType;
    vaccinationSchedules: VaccinationScheduleType[];
  };
  readonly stepStatus: {
    [key in StepKey]: StepStatus;
  };
}

export type FormAction =
  | { type: "SET_FORM_DATA"; payload: Partial<FormState["formData"]> }
  | { type: "SET_STEP_STATUS"; payload: Partial<FormState["stepStatus"]> };

export interface ProductFormContextType {
  state: FormState;
  dispatch: Dispatch<FormAction>;
  categories: Category[];
  isEditing: boolean;
  product?: Product;
}

export const [ProductFormContextProvider, useProductFormContext] =
  createSafeContext<ProductFormContextType>(
    "useProductFormContext must be used within a ProductFormContextProvider",
  );