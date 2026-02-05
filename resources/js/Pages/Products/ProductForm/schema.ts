import * as z from "zod";

// Basic Info Schema
export const basicInfoSchema = z.object({
  name: z.string().min(1, "validation.product_name_required"),
  sku: z.string().min(1, "validation.product_sku_required"),
  brand: z.string().optional(),
  description: z.string().optional(),
  barcode: z.string().optional(),
  image: z
    .instanceof(File)
    .refine(
      (file) => !file || file.size <= 5000000,
      "validation.product_image_size"
    )
    .refine(
      (file) => !file || ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"].includes(file.type),
      "validation.product_image_format"
    )
    .optional()
    .nullable(),
  previewImage: z.string().optional().nullable(),
});

// Category & Type Schema
export const categoryTypeSchema = z.object({
  category_product_id: z.string().min(1, "validation.product_category_required"),
  type: z.number().min(1).max(5, "validation.product_type_invalid"),
});

// Medical Details Schema
export const medicalDetailsSchema = z.object({
  dosage_form: z.string().optional(),
  administration_route: z.string().optional(),
  target_species: z.array(z.string()).optional(),
});

// Vaccine Info Schema
export const vaccineInfoSchema = z.object({
  manufacturer: z.string().min(1, "validation.vaccine_manufacturer_required"),
  batch_number: z.string().min(1, "validation.vaccine_batch_number_required"),
  expiry_date: z.string().optional(),
  dosage_ml: z.number().positive("validation.vaccine_dosage_positive").optional().nullable(),
  vaccine_instructions: z.string().optional(),
});

// Stock & Status Schema
export const stockStatusSchema = z.object({
  minimum_stock_level: z.number().min(1, "validation.stock_level_min"), // min 1
  maximum_stock_level: z.number().min(1, "validation.stock_level_min"),
  availability_status: z.number().min(1).max(4, "validation.availability_status_invalid"),
  prescription_required: z.boolean(),
  is_active: z.boolean(),
  notes: z.string().optional(),
}).superRefine((data, ctx) => {
  // Validate that maximum_stock_level is greater than minimum_stock_level
  if (
    typeof data.minimum_stock_level === "number" &&
    typeof data.maximum_stock_level === "number" &&
    data.maximum_stock_level <= data.minimum_stock_level
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "validation.stock_level_max_gt_min",
      path: ["maximum_stock_level"],
    });
  }
});

// Vaccination Schedule Schema
export const vaccinationScheduleSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "validation.vaccination_schedule_name_required"),
  description: z.string().optional(),
  sequence_order: z.number().min(1, "validation.vaccination_sequence_order_min"),
  age_weeks: z.number().min(0, "validation.vaccination_age_weeks_min").optional().nullable(),
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