import z from "zod";

export const subscriptionPlanSchema = z.object({
    name_en: z.string().min(1, 'subscription_plan_name_en_required'),
    name_ar: z.string().min(1, 'subscription_plan_name_ar_required'),
    name_fr: z.string().min(1, 'subscription_plan_name_fr_required'),
    description_en: z.string().min(1, 'subscription_plan_description_en_required'),
    description_ar: z.string().min(1, 'subscription_plan_description_ar_required'),
    description_fr: z.string().min(1, 'subscription_plan_description_fr_required'),
    features_en: z.array(z.string()),
    features_ar: z.array(z.string()),
    features_fr: z.array(z.string()),
    selected_features: z.array(z.string()),
    price: z.number().min(0.01, 'subscription_plan_price_min'),
    yearly_price: z.number().min(1, 'subscription_plan_yearly_price_required'),
    max_clients: z.number().min(1, 'subscription_plan_max_clients_required'),
    max_pets: z.number().min(1, 'subscription_plan_max_pets_required'),
    max_appointments: z.number().min(1, 'subscription_plan_max_appointments_required'),
    is_active: z.boolean(),
    is_popular: z.boolean(),
    sort_order: z.number().min(0, 'subscription_plan_sort_order_min'),
  }).refine((data) => data.yearly_price > data.price, {
    message: 'subscription_plan_yearly_price_gt_monthly',
    path: ['yearly_price'],
  });
  
export type SubscriptionPlanFormData = z.infer<typeof subscriptionPlanSchema>;