// Import Dependencies
import * as Yup from "yup";

// ----------------------------------------------------------------------

export const basicInfoSchema = Yup.object().shape({
  name_en: Yup.string().trim().required("English name is required"),
  name_ar: Yup.string().trim().required("Arabic name is required"),
  name_fr: Yup.string().trim().required("French name is required"),
  description_en: Yup.string().trim().required("English description is required"),
  description_ar: Yup.string().trim().required("Arabic description is required"),
  description_fr: Yup.string().trim().required("French description is required"),
  is_active: Yup.boolean(),
  is_popular: Yup.boolean(),
  sort_order: Yup.number().min(0, "Sort order must be 0 or greater").required("Sort order is required"),
});

export const pricingSchema = Yup.object().shape({
  price: Yup.number()
    .min(0, "Price must be 0 or greater")
    .required("Price is required"),
  yearly_price: Yup.number()
    .min(0, "Yearly price must be 0 or greater")
    .optional(),
});

export const featuresSchema = Yup.object().shape({
  selected_features: Yup.array()
    .of(Yup.string())
    .min(1, "At least one feature must be selected"),
});

export const limitsSchema = Yup.object().shape({
  max_clients: Yup.number()
    .min(1, "Max clients must be at least 1")
    .optional(),
  max_pets: Yup.number()
    .min(1, "Max pets must be at least 1")
    .optional(),
  max_appointments: Yup.number()
    .min(1, "Max appointments must be at least 1")
    .optional(),
});

export type BasicInfoType = {
  name_en: string;
  name_ar: string;
  name_fr: string;
  description_en: string;
  description_ar: string;
  description_fr: string;
  is_active: boolean;
  is_popular: boolean;
  sort_order: number;
};

export type PricingType = {
  price: number;
  yearly_price?: number;
};

export type FeaturesType = {
  selected_features: string[];
};

export type LimitsType = {
  max_clients?: number;
  max_pets?: number;
  max_appointments?: number;
};
