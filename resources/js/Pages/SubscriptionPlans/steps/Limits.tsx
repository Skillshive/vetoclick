// Local Imports
import { Button, Input } from "@/components/ui";
import { useSubscriptionPlanFormContext } from "../SubscriptionPlanFormContext";
import { limitsSchema, LimitsType } from "@/schemas/subscriptionPlanSchema";
import { useTranslation } from "@/hooks/useTranslation";
import { useToast } from "@/Components/common/Toast/ToastContext";
import { useState, useEffect } from "react";
import { CalendarIcon, PawPrint, PersonStanding } from "lucide-react";
import { useForm, router } from "@inertiajs/react";
declare const route: (name: string, params?: any, absolute?: boolean) => string;

// ----------------------------------------------------------------------

export function Limits({
  setCurrentStep,
  onFinalSubmit,
  plan,
  isEditing = false,
  backendErrors,
}: {
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  onFinalSubmit?: () => void;
  plan?: any;
  isEditing?: boolean;
  backendErrors?: any;
}) {
  const subscriptionPlanFormCtx = useSubscriptionPlanFormContext();
  const { t } = useTranslation();
  const { showToast } = useToast();
  
  const [limitsValidationErrors, setLimitsValidationErrors] = useState<{
    max_clients?: string;
    max_pets?: string;
    max_appointments?: string;
  }>({});

  // Calculate limitsData outside of onSubmit to make it available throughout the component
  const limitsData = {
    ...subscriptionPlanFormCtx.state.formData.limits,
    max_clients: typeof subscriptionPlanFormCtx.state.formData.limits.max_clients === 'string' 
      ? parseInt(subscriptionPlanFormCtx.state.formData.limits.max_clients) || 0
      : subscriptionPlanFormCtx.state.formData.limits.max_clients,
    max_pets: typeof subscriptionPlanFormCtx.state.formData.limits.max_pets === 'string'
      ? parseInt(subscriptionPlanFormCtx.state.formData.limits.max_pets) || 0
      : subscriptionPlanFormCtx.state.formData.limits.max_pets,
    max_appointments: typeof subscriptionPlanFormCtx.state.formData.limits.max_appointments === 'string'
      ? parseInt(subscriptionPlanFormCtx.state.formData.limits.max_appointments) || 0
      : subscriptionPlanFormCtx.state.formData.limits.max_appointments,
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = limitsSchema.safeParse(limitsData);
    
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      setLimitsValidationErrors({
        max_clients: errors.max_clients?.[0] ? t(errors.max_clients[0]) : undefined,
        max_pets: errors.max_pets?.[0] ? t(errors.max_pets[0]) : undefined,
        max_appointments: errors.max_appointments?.[0] ? t(errors.max_appointments[0]) : undefined,
      });
      return;
    }

    // Clear validation errors
    setLimitsValidationErrors({});
    
    // Update the limits data in context
    subscriptionPlanFormCtx.dispatch({
      type: "SET_FORM_DATA",
      payload: { limits: limitsData },
    });
    
    subscriptionPlanFormCtx.dispatch({
      type: "SET_STEP_STATUS",
      payload: { limits: { isDone: true } },
    });

    const submissionData = {
      // Basic Info
      name_en: subscriptionPlanFormCtx.state.formData.basicInfo.name_en,
      name_ar: subscriptionPlanFormCtx.state.formData.basicInfo.name_ar,
      name_fr: subscriptionPlanFormCtx.state.formData.basicInfo.name_fr,
      description_en: subscriptionPlanFormCtx.state.formData.basicInfo.description_en,
      description_ar: subscriptionPlanFormCtx.state.formData.basicInfo.description_ar,
      description_fr: subscriptionPlanFormCtx.state.formData.basicInfo.description_fr,
      is_active: isEditing ? plan.data?.is_active : subscriptionPlanFormCtx.state.formData.basicInfo.is_active,
      is_popular: subscriptionPlanFormCtx.state.formData.basicInfo.is_popular,
      sort_order: subscriptionPlanFormCtx.state.formData.basicInfo.sort_order,

      // Pricing
      price: typeof subscriptionPlanFormCtx.state.formData.pricing.price === 'string'
        ? parseFloat(subscriptionPlanFormCtx.state.formData.pricing.price) || 0
        : subscriptionPlanFormCtx.state.formData.pricing.price,
      yearly_price: typeof subscriptionPlanFormCtx.state.formData.pricing.yearly_price === 'string'
        ? parseFloat(subscriptionPlanFormCtx.state.formData.pricing.yearly_price) || 0
        : subscriptionPlanFormCtx.state.formData.pricing.yearly_price,

      // Features
      selected_features: subscriptionPlanFormCtx.state.formData.features.selected_features || [],

      // Limits - Use the validated limitsData directly
      max_clients: limitsData.max_clients,
      max_pets: limitsData.max_pets,
      max_appointments: limitsData.max_appointments,
    };

    // Submit the form with data passed directly
    if (isEditing && plan) {
      const planUuid = plan.data?.uuid || plan.uuid;
      router.put(route('subscription-plans.update', planUuid), submissionData, {
        onSuccess: () => {
          showToast({
            type: 'success',
            message: t('common.plan_updated_success'),
            duration: 3000,
          });
          if (onFinalSubmit) {
            onFinalSubmit();
          }
        },
        onError: (errors: any) => {
          showToast({
            type: 'error',
            message: t('common.plan_update_error'),
            duration: 3000,
          });
        }
      });
    } else {
      router.post(route('subscription-plans.store'), submissionData, {
        onSuccess: () => {
          showToast({
            type: 'success',
            message: t('common.plan_created_success'),
            duration: 3000,
          });
          if (onFinalSubmit) {
            onFinalSubmit();
          }
        },
        onError: (errors: any) => {
          showToast({
            type: 'error',
            message: t('common.plan_create_error'),
            duration: 3000,
          });
        }
      });
    }
  };

  // Prepare form data for submission
  const { data: formData, setData, post, put, processing, errors: formErrors } = useForm({
    name_en: subscriptionPlanFormCtx.state.formData.basicInfo.name_en,
    name_ar: subscriptionPlanFormCtx.state.formData.basicInfo.name_ar,
    name_fr: subscriptionPlanFormCtx.state.formData.basicInfo.name_fr,
    description_en: subscriptionPlanFormCtx.state.formData.basicInfo.description_en,
    description_ar: subscriptionPlanFormCtx.state.formData.basicInfo.description_ar,
    description_fr: subscriptionPlanFormCtx.state.formData.basicInfo.description_fr,
    price: subscriptionPlanFormCtx.state.formData.pricing.price,
    yearly_price: subscriptionPlanFormCtx.state.formData.pricing.yearly_price || 0,
    selected_features: subscriptionPlanFormCtx.state.formData.features.selected_features,
    max_clients: subscriptionPlanFormCtx.state.formData.limits.max_clients || 0,
    max_pets: subscriptionPlanFormCtx.state.formData.limits.max_pets || 0,
    max_appointments: subscriptionPlanFormCtx.state.formData.limits.max_appointments || 0,
    is_active: true,
    is_popular: subscriptionPlanFormCtx.state.formData.basicInfo.is_popular,
    sort_order: subscriptionPlanFormCtx.state.formData.basicInfo.sort_order,
  });



  return (
    <form onSubmit={onSubmit} autoComplete="off">
      <div className="mt-6 space-y-6">

        {/* Limits Form */}
        <div className="space-y-4">

          
      <div>
            <Input
        type="number"
        min="0"              
        value={subscriptionPlanFormCtx.state.formData.limits.max_clients}
              onChange={(e) => {
                const newValue = e.target.value ? parseInt(e.target.value) : 0;
                subscriptionPlanFormCtx.dispatch({
                  type: "SET_FORM_DATA",
                  payload: { limits: { ...subscriptionPlanFormCtx.state.formData.limits, max_clients: newValue } },
                });
                const result = limitsSchema.safeParse({
                  ...subscriptionPlanFormCtx.state.formData.limits,
                  max_clients: e.target.value ? parseInt(e.target.value) : 0,
                });
                if (!result.success) {
                  const errors = result.error.flatten().fieldErrors;
                  setLimitsValidationErrors(prev => ({
                    ...prev,
                    max_clients: errors.max_clients?.[0] ? t(errors.max_clients[0]) : undefined,
                  }));
                } else {
                  setLimitsValidationErrors(prev => ({
                    ...prev,
                    max_clients: undefined,
                  }));
                }
              }}
              label={t('common.max_clients')}
              placeholder={t('common.max_clients')}
              className={limitsValidationErrors.max_clients ? 'border-red-500' : ''}
              required
              leftIcon={<PersonStanding className="size-5" />}
            />
            {
              limitsValidationErrors.max_clients && (
                <p className="text-red-500 text-sm mt-1">{limitsValidationErrors.max_clients}</p>
              )
            }
          </div>
          
      <div>
            <Input
        type="number"
        min="0"              
        value={subscriptionPlanFormCtx.state.formData.limits.max_pets}
              onChange={(e) => {
                const newValue = e.target.value ? parseInt(e.target.value) : 0;
                subscriptionPlanFormCtx.dispatch({
                  type: "SET_FORM_DATA",
                  payload: { limits: { ...subscriptionPlanFormCtx.state.formData.limits, max_pets: newValue } },
                });
                const result = limitsSchema.safeParse({
                  ...subscriptionPlanFormCtx.state.formData.limits,
                  max_pets: e.target.value ? parseInt(e.target.value) : 0,
                });
                if (!result.success) {
                  const errors = result.error.flatten().fieldErrors;
                  setLimitsValidationErrors(prev => ({
                    ...prev,
                    max_pets: errors.max_pets?.[0] ? t(errors.max_pets[0]) : undefined,
                  }));
                } else {
                  setLimitsValidationErrors(prev => ({
                    ...prev,
                    max_pets: undefined,
                  }));
                }
              }}
              label={t('common.max_pets')}
              placeholder={t('common.max_pets')}
              className={limitsValidationErrors.max_pets ? 'border-red-500' : ''}
              required
              leftIcon={<PawPrint className="size-5" />}
            />
            {
              limitsValidationErrors.max_pets && (
                <p className="text-red-500 text-sm mt-1">{limitsValidationErrors.max_pets}</p>
              )
            }
          </div>
         
      <div>
            <Input
        type="number"
        min="0"              
        value={subscriptionPlanFormCtx.state.formData.limits.max_appointments}
              onChange={(e) => {
                const newValue = e.target.value ? parseInt(e.target.value) : 0;
                subscriptionPlanFormCtx.dispatch({
                  type: "SET_FORM_DATA",
                  payload: { limits: { ...subscriptionPlanFormCtx.state.formData.limits, max_appointments: newValue } },
                });
                const result = limitsSchema.safeParse({
                  ...subscriptionPlanFormCtx.state.formData.limits,
                  max_appointments: e.target.value ? parseInt(e.target.value) : 0,
                });
                if (!result.success) {
                  const errors = result.error.flatten().fieldErrors;
                  setLimitsValidationErrors(prev => ({
                    ...prev,
                    max_appointments: errors.max_appointments?.[0] ? t(errors.max_appointments[0]) : undefined,
                  }));
                } else {
                  setLimitsValidationErrors(prev => ({
                    ...prev,
                    max_appointments: undefined,
                  }));
                }
              }}
              label={t('common.max_appointments')}
              placeholder={t('common.max_appointments')}
              className={limitsValidationErrors.max_appointments ? 'border-red-500' : ''}
              required
              leftIcon={<CalendarIcon className="size-5" />}
            />
            {
              limitsValidationErrors.max_appointments && (
                <p className="text-red-500 text-sm mt-1">{limitsValidationErrors.max_appointments}</p>
              )
            }
          </div>
        </div>
        </div>

      <div className="mt-8 flex justify-between">
        <Button 
          type="button" 
          className="min-w-[7rem]"
          onClick={() => setCurrentStep(2)}
        >
          Previous
        </Button>
        <Button 
          type="submit" 
          className="min-w-[7rem]" 
          color="primary"
          disabled={processing}
        >
          {processing ? 'Saving...' : 'Complete'}
        </Button>
      </div>
    </form>
  );
}
