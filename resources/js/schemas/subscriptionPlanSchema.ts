import z from "zod";

// export const subscriptionPlanSchema = z.object({
//     name_en: z.string().min(1, 'subscription_plan_name_en_required'),
//     name_ar: z.string().min(1, 'subscription_plan_name_ar_required'),
//     name_fr: z.string().min(1, 'subscription_plan_name_fr_required'),
//     description_en: z.string().min(1, 'subscription_plan_description_en_required'),
//     description_ar: z.string().min(1, 'subscription_plan_description_ar_required'),
//     description_fr: z.string().min(1, 'subscription_plan_description_fr_required'),
//     features_en: z.array(z.string()),
//     features_ar: z.array(z.string()),
//     features_fr: z.array(z.string()),
//     selected_features: z.array(z.string()),
//     price: z.number().min(0.01, 'subscription_plan_price_min'),
//     yearly_price: z.number().min(1, 'subscription_plan_yearly_price_required'),
//     max_clients: z.number().min(1, 'subscription_plan_max_clients_required'),
//     max_pets: z.number().min(1, 'subscription_plan_max_pets_required'),
//     max_appointments: z.number().min(1, 'subscription_plan_max_appointments_required'),
  
//   }).refine((data) => data.yearly_price > data.price, {
//     message: 'subscription_plan_yearly_price_gt_monthly',
//     path: ['yearly_price'],
//   });

export const basicInfoSchema = z.object({
    name_en: z.string().min(1, 'validation.name_en_required')
    .min(2, 'validation.name_en_min_length')
    .max(50, 'validation.name_en_max_length')
    .regex(/^[a-zA-Z\s]+$/, 'validation.name_en_invalid_chars'),
    name_ar: z.string().min(1, 'validation.name_ar_required')
    .min(2, 'validation.name_ar_min_length')
    .max(50, 'validation.name_ar_max_length')
    // .regex(/^[a-zA-Z\s]+$/, 'validation.name_ar_invalid_chars')
    ,
    name_fr: z.string().min(1, 'validation.name_fr_required')
    .min(2, 'validation.name_fr_min_length')
    .max(50, 'validation.name_fr_max_length')
    .regex(/^[a-zA-Z\s]+$/, 'validation.name_fr_invalid_chars'),
    description_en: z.string().min(1, 'validation.description_en_required'),
    description_ar: z.string().min(1, 'validation.description_ar_required')
    .min(2, 'validation.description_ar_min_length')
    .max(50, 'validation.description_ar_max_length')
    // .regex(/^[a-zA-Z\s]+$/, 'validation.description_ar_invalid_chars')
    ,
    description_fr: z.string().min(1, 'validation.description_fr_required'),
    is_active: z.boolean(),
    is_popular: z.boolean(),
    sort_order: z.preprocess(
        (val) => {
            if (typeof val === "string" && val.trim() !== "") {
                const parsed = Number(val);
                if (!isNaN(parsed)) return parsed;
            }
            return val;
        },
        z.number().min(0, 'validation.sort_order_min')
    ),
});

export const pricingSchema = z.object({
    price: z.number().min(0.01, 'subscription_plan_price_min'),
    yearly_price: z.number().min(1, 'validation.subscription_plan_yearly_price_required'),
}).refine((data) => data.yearly_price > data.price, {
  message: 'validation.subscription_plan_yearly_price_gt_monthly',
  path: ['yearly_price'],
});

export const featuresSchema = z.object({
    selected_features: z.array(z.string()),
});

export const limitsSchema = z.object({
    max_clients: z.number().min(1, 'validation.subscription_plan_max_clients_required'),
    max_pets: z.number().min(1, 'validation.subscription_plan_max_pets_required'),
    max_appointments: z.number().min(1, 'validation.subscription_plan_max_appointments_required'),
});
// export type SubscriptionPlanFormData = z.infer<typeof subscriptionPlanSchema>;
export type BasicInfoType = z.infer<typeof basicInfoSchema>;
export type PricingType = z.infer<typeof pricingSchema>;
export type FeaturesType = z.infer<typeof featuresSchema>;
export type LimitsType = z.infer<typeof limitsSchema>;