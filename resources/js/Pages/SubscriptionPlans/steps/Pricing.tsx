// Local Imports
import { Button, Input } from "@/components/ui";
import { useSubscriptionPlanFormContext } from "../SubscriptionPlanFormContext";
import { useTranslation } from "@/hooks/useTranslation";
import { useState } from "react";
import { pricingSchema } from "@/schemas/subscriptionPlanSchema";
import { TagIcon } from "@heroicons/react/24/outline";

// ----------------------------------------------------------------------

export function Pricing({
  setCurrentStep,
  featureGroups,
  allFeatures,
  onFinalSubmit,
  plan,
  isEditing,
  backendErrors,
}: {
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  featureGroups?: any[];
  allFeatures?: any[];
  onFinalSubmit?: () => void;
  plan?: any;
  isEditing?: boolean;
  backendErrors?: any;
}) {
  const subscriptionPlanFormCtx = useSubscriptionPlanFormContext();
  const { t } = useTranslation();

  const [pricingValidationErrors, setPricingValidationErrors] = useState<{
    price?: string;
    yearly_price?: string;
  }>({});

  
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate the form data
    const pricingData = {
      ...subscriptionPlanFormCtx.state.formData.pricing,
      price: typeof subscriptionPlanFormCtx.state.formData.pricing.price === 'string' 
        ? parseFloat(subscriptionPlanFormCtx.state.formData.pricing.price) || 0
        : subscriptionPlanFormCtx.state.formData.pricing.price,
      yearly_price: typeof subscriptionPlanFormCtx.state.formData.pricing.yearly_price === 'string'
        ? parseFloat(subscriptionPlanFormCtx.state.formData.pricing.yearly_price) || 0
        : subscriptionPlanFormCtx.state.formData.pricing.yearly_price,
    };
    const result = pricingSchema.safeParse(pricingData);
    
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      setPricingValidationErrors({
        price: errors.price?.[0] ? t(errors.price[0]) : undefined,
        yearly_price: errors.yearly_price?.[0] ? t(errors.yearly_price[0]) : undefined,
      });
      return;
    }

    // Clear validation errors
    setPricingValidationErrors({});
    
    subscriptionPlanFormCtx.dispatch({
      type: "SET_STEP_STATUS",
      payload: { pricing: { isDone: true } },
    });
    setCurrentStep(2);
  };


  return (
    <form onSubmit={onSubmit} autoComplete="off">
      <div className="mt-6 space-y-4">

        
      <div>
            <Input
        type="number"
        step="0.01"
        min="0"              
        value={subscriptionPlanFormCtx.state.formData.pricing.price}
              onChange={(e) => {
                subscriptionPlanFormCtx.dispatch({
                  type: "SET_FORM_DATA",
                  payload: { pricing: { ...subscriptionPlanFormCtx.state.formData.pricing, price: e.target.value } },
                });
                const result = pricingSchema.safeParse({
                  ...subscriptionPlanFormCtx.state.formData.pricing,
                  price: e.target.value ? parseFloat(e.target.value) : 0,
                });
                if (!result.success) {
                  const errors = result.error.flatten().fieldErrors;
                  setPricingValidationErrors(prev => ({
                    ...prev,
                    price: errors.price?.[0] ? t(errors.price[0]) : undefined,
                  }));
                } else {
                  setPricingValidationErrors(prev => ({
                    ...prev,
                    price: undefined,
                  }));
                }
              }}
              label={t('common.plan_price_label')}
              placeholder={t('common.category_name_placeholder')}
              className={pricingValidationErrors.price ? 'border-red-500' : ''}
              required
              leftIcon={<TagIcon className="size-5" />}
            />
            {
              pricingValidationErrors.price && (
                <p className="text-red-500 text-sm mt-1">{pricingValidationErrors.price}</p>
              )
            }
          </div>

      <div>
            <Input
        type="number"
        step="0.01"
        min="0"              
        value={subscriptionPlanFormCtx.state.formData.pricing.yearly_price}
              onChange={(e) => {
                subscriptionPlanFormCtx.dispatch({
                  type: "SET_FORM_DATA",
                  payload: { pricing: { ...subscriptionPlanFormCtx.state.formData.pricing, yearly_price: e.target.value } },
                });
                const result = pricingSchema.safeParse({
                  ...subscriptionPlanFormCtx.state.formData.pricing,
                  yearly_price: e.target.value ? parseFloat(e.target.value) : 0,
                });
                if (!result.success) {
                  const errors = result.error.flatten().fieldErrors;
                  setPricingValidationErrors(prev => ({
                    ...prev,
                    yearly_price: errors.yearly_price?.[0] ? t(errors.yearly_price[0]) : undefined,
                  }));
                } else {
                  setPricingValidationErrors(prev => ({
                    ...prev,
                    yearly_price: undefined,
                  }));
                }
              }}
              label={t('common.plan_yearly_price_label')}
              placeholder={t('common.category_name_placeholder')}
              className={pricingValidationErrors.yearly_price ? 'border-red-500' : ''}
              required
              leftIcon={<TagIcon className="size-5" />}
            />
            {
              pricingValidationErrors.yearly_price && (
                <p className="text-red-500 text-sm mt-1">{pricingValidationErrors.yearly_price}</p>
              )
            }
          </div>
      </div>
      <div className="mt-8 flex justify-between">
        <Button 
          type="button" 
          className="min-w-[7rem]"
          onClick={() => setCurrentStep(0)}
        >
          Previous
        </Button>
        <Button type="submit" className="min-w-[7rem]" color="primary">
          Next
        </Button>
      </div>
    </form>
  );
}
