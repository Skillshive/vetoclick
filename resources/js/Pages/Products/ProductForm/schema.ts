import * as z from "zod";

// Basic Info Schema
export const basicInfoSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  sku: z.string().min(1, "SKU is required"),
  brand: z.string().optional(),
  description: z.string().optional(),
  barcode: z.string().optional(),
  image: z
    .instanceof(File)
    .refine(
      (file) => !file || file.size <= 5000000,
      "Image must be less than 5MB"
    )
    .refine(
      (file) => !file || ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"].includes(file.type),
      "Only .jpg, .jpeg, .png, .gif, and .webp formats are supported"
    )
    .optional()
    .nullable(),
  previewImage: z.string().optional().nullable(),
});

// Category & Type Schema
export const categoryTypeSchema = z.object({
  category_product_id: z.string().min(1, "Category is required"),
  type: z.number().min(1).max(4, "Invalid product type"),
});

// Medical Details Schema
export const medicalDetailsSchema = z.object({
  dosage_form: z.string().optional(),
  administration_route: z.string().optional(),
  target_species: z.array(z.string()).optional(),
});

// Vaccine Info Schema
export const vaccineInfoSchema = z.object({
  manufacturer: z.string().min(1, "Manufacturer is required"),
  batch_number: z.string().min(1, "Batch number is required"),
  expiry_date: z.string().optional(),
  dosage_ml: z.number().positive("Dosage must be positive").optional().nullable(),
  vaccine_instructions: z.string().optional(),
});

// Stock & Status Schema
export const stockStatusSchema = z.object({
  minimum_stock_level: z.number().min(0, "Must be 0 or greater"),
  maximum_stock_level: z.number().min(0, "Must be 0 or greater"),
  availability_status: z.number().min(1).max(4, "Invalid availability status"),
  prescription_required: z.boolean(),
  is_active: z.boolean(),
  notes: z.string().optional(),
});

// Vaccination Schedule Schema
export const vaccinationScheduleSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Schedule name is required"),
  description: z.string().optional(),
  sequence_order: z.number().min(1, "Sequence order must be at least 1"),
  age_weeks: z.number().min(0, "Age must be 0 or greater").optional().nullable(),
  is_required: z.boolean().default(true),
  notes: z.string().optional(),
});

// Complete Form Schema
export const productFormSchema = z.object({
  basicInfo: basicInfoSchema,
  categoryType: categoryTypeSchema,
  medicalDetails: medicalDetailsSchema,
  vaccineInfo: vaccineInfoSchema,
  stockStatus: stockStatusSchema,
  vaccinationSchedules: z.array(vaccinationScheduleSchema).optional(),
});

// Type exports
export type BasicInfoType = z.infer<typeof basicInfoSchema>;
export type CategoryTypeType = z.infer<typeof categoryTypeSchema>;
export type MedicalDetailsType = z.infer<typeof medicalDetailsSchema>;
export type VaccineInfoType = z.infer<typeof vaccineInfoSchema>;
export type StockStatusType = z.infer<typeof stockStatusSchema>;
export type VaccinationScheduleType = z.infer<typeof vaccinationScheduleSchema>;
export type ProductFormType = z.infer<typeof productFormSchema>;