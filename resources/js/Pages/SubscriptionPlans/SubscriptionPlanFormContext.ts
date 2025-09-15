import { createSafeContext } from "@/utils/createSafeContext";
import { Dispatch } from "react";

export interface StepStatus {
  isDone: boolean;
}

export type StepKey =
  | "basicInfo"
  | "pricing"
  | "features"
  | "limits";

export interface BasicInfoType {
  name_en: string;
  name_ar: string;
  name_fr: string;
  description_en: string;
  description_ar: string;
  description_fr: string;
  is_active: boolean;
  is_popular: boolean;
  sort_order: number;
}

export interface PricingType {
  price: number;
  yearly_price?: number;
}

export interface FeaturesType {
  selected_features: string[];
}

export interface LimitsType {
  max_clients?: number;
  max_pets?: number;
  max_appointments?: number;
}

export interface FormState {
  readonly formData: {
    basicInfo: BasicInfoType;
    pricing: PricingType;
    features: FeaturesType;
    limits: LimitsType;
  };
  readonly stepStatus: {
    [key in StepKey]: StepStatus;
  };
}

export type FormAction =
  | { type: "SET_FORM_DATA"; payload: Partial<FormState["formData"]> }
  | { type: "SET_STEP_STATUS"; payload: Partial<FormState["stepStatus"]> }
  | { type: "RESET_FORM" };

export interface SubscriptionPlanFormContextType {
  state: FormState;
  dispatch: Dispatch<FormAction>;
}

export const [SubscriptionPlanFormContextProvider, useSubscriptionPlanFormContext] =
  createSafeContext<SubscriptionPlanFormContextType>(
    "useSubscriptionPlanFormContext must be used within a SubscriptionPlanFormContextProvider",
  );
