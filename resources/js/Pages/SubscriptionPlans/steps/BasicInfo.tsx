import { Button, Input,  Switch, Textarea } from "@/components/ui";
import { useSubscriptionPlanFormContext } from "../SubscriptionPlanFormContext";
import { useTranslation } from "@/hooks/useTranslation";
import { useState } from "react";
import { basicInfoSchema } from "@/schemas/subscriptionPlanSchema";
import { TagIcon } from "@heroicons/react/24/outline";

// ----------------------------------------------------------------------

export function BasicInfo({
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

  const [basicInfoValidationErrors, setBasicInfoValidationErrors] = useState<{
    name_en?: string;
    name_ar?: string;
    name_fr?: string;
    description_en?: string;
    description_ar?: string;
    description_fr?: string;
    sort_order?: string;
    is_popular?: string;
}>({});

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate the form data
    const result = basicInfoSchema.safeParse(subscriptionPlanFormCtx.state.formData.basicInfo);
    
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      setBasicInfoValidationErrors({
        name_en: errors.name_en?.[0] ? t(errors.name_en[0]) : undefined,
        name_ar: errors.name_ar?.[0] ? t(errors.name_ar[0]) : undefined,
        name_fr: errors.name_fr?.[0] ? t(errors.name_fr[0]) : undefined,
        description_en: errors.description_en?.[0] ? t(errors.description_en[0]) : undefined,
        description_ar: errors.description_ar?.[0] ? t(errors.description_ar[0]) : undefined,
        description_fr: errors.description_fr?.[0] ? t(errors.description_fr[0]) : undefined,
        sort_order: errors.sort_order?.[0] ? t(errors.sort_order[0]) : undefined,
      });
      return;
    }

    // Clear validation errors
    setBasicInfoValidationErrors({});
    
    subscriptionPlanFormCtx.dispatch({
      type: "SET_STEP_STATUS",
      payload: { basicInfo: { isDone: true } },
    });
    setCurrentStep(1);
  };

  return (
    <form onSubmit={onSubmit} autoComplete="off">
      <div className="mt-6 space-y-4">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">


          <div>
        <Input
              type="text"
              value={subscriptionPlanFormCtx.state.formData.basicInfo.name_en}
              onChange={(e) => {
                subscriptionPlanFormCtx.dispatch({
                  type: "SET_FORM_DATA",
                  payload: { basicInfo: { ...subscriptionPlanFormCtx.state.formData.basicInfo, name_en: e.target.value } },
                });
                const result = basicInfoSchema.safeParse({
                  ...subscriptionPlanFormCtx.state.formData.basicInfo,
                  name_en: e.target.value,
                });
                if (!result.success) {
                  const errors = result.error.flatten().fieldErrors;
                  setBasicInfoValidationErrors(prev => ({
                    ...prev,
                    name_en: errors.name_en?.[0] ? t(errors.name_en[0]) : undefined,
                  }));
                } else {
                  setBasicInfoValidationErrors(prev => ({
                    ...prev,
                    name_en: undefined,
                  }));
                }
              }}
              label={t('common.plan_name_en_label')}
              placeholder={t('common.category_name_placeholder')}
              className={basicInfoValidationErrors.name_en ? 'border-red-500' : ''}
              required
              leftIcon={<TagIcon className="size-5" />}
            />
            {
              basicInfoValidationErrors.name_en && (
                <p className="text-red-500 text-sm mt-1">{basicInfoValidationErrors.name_en}</p>
              )
            }
          </div>

          <div>
        <Input
              type="text"
              value={subscriptionPlanFormCtx.state.formData.basicInfo.name_ar}
              onChange={(e) => {
                subscriptionPlanFormCtx.dispatch({
                  type: "SET_FORM_DATA",
                  payload: { basicInfo: { ...subscriptionPlanFormCtx.state.formData.basicInfo, name_ar: e.target.value } },
                });
                const result = basicInfoSchema.safeParse({
                  ...subscriptionPlanFormCtx.state.formData.basicInfo,
                  name_ar: e.target.value,
                });
                if (!result.success) {
                  const errors = result.error.flatten().fieldErrors;
                  setBasicInfoValidationErrors(prev => ({
                    ...prev,
                    name_ar: errors.name_ar?.[0] ? t(errors.name_ar[0]) : undefined,
                  }));
                } else {
                  setBasicInfoValidationErrors(prev => ({
                    ...prev,
                    name_ar: undefined,
                  }));
                }
              }}
              label={t('common.plan_name_ar_label')}
              placeholder={t('common.category_name_placeholder')}
              className={basicInfoValidationErrors.name_ar ? 'border-red-500' : ''}
              required
              leftIcon={<TagIcon className="size-5" />}
            />
            {
              (basicInfoValidationErrors.name_ar) && (
                <p className="text-red-500 text-sm mt-1">{basicInfoValidationErrors?.name_ar}</p>
              )
            }
          </div>
          <div>
        <Input
              type="text"
              value={subscriptionPlanFormCtx.state.formData.basicInfo.name_fr}
              onChange={(e) => {
                subscriptionPlanFormCtx.dispatch({
                  type: "SET_FORM_DATA",
                  payload: { basicInfo: { ...subscriptionPlanFormCtx.state.formData.basicInfo, name_fr: e.target.value } },
                });
                const result = basicInfoSchema.safeParse({
                  ...subscriptionPlanFormCtx.state.formData.basicInfo,
                  name_fr: e.target.value,
                });
                if (!result.success) {
                  const errors = result.error.flatten().fieldErrors;
                  setBasicInfoValidationErrors(prev => ({
                    ...prev,
                    name_fr: errors.name_fr?.[0] ? t(errors.name_fr[0]) : undefined,
                  }));
                } else {
                  setBasicInfoValidationErrors(prev => ({
                    ...prev,
                    name_fr: undefined,
                  }));
                }
              }}
              label={t('common.plan_name_fr_label')}
              placeholder={t('common.category_name_placeholder')}
              className={basicInfoValidationErrors.name_fr ? 'border-red-500' : ''}
              required
              leftIcon={<TagIcon className="size-5" />}
            />
            {
              (basicInfoValidationErrors.name_fr) && (
                <p className="text-red-500 text-sm mt-1">{basicInfoValidationErrors?.name_fr}</p>
              )
            }
          </div>
        </div>

        {/* English Description */}
        <div className="flex flex-col">


          <Textarea
            id="description_en"
            label={t('common.description_en')}
            value={subscriptionPlanFormCtx.state.formData.basicInfo.description_en}
            onChange={(e) => {
              subscriptionPlanFormCtx.dispatch({
                type: "SET_FORM_DATA",
                payload: { basicInfo: { ...subscriptionPlanFormCtx.state.formData.basicInfo, description_en: e.target.value } },
              });
              const result = basicInfoSchema.safeParse({
                ...subscriptionPlanFormCtx.state.formData.basicInfo,
                description_en: e.target.value,
              });
              if (!result.success) {
                const errors = result.error.flatten().fieldErrors;
                setBasicInfoValidationErrors(prev => ({
                  ...prev,
                  description_en: errors.description_en?.[0] ? t(errors.description_en[0]) : undefined,
                }));
              } else {
                setBasicInfoValidationErrors(prev => ({
                  ...prev,
                  description_en: undefined,
                }));
              }
            }}
            placeholder={t('common.description_en')}
            rows={3}
            className={basicInfoValidationErrors.description_en ? 'border-red-500' : ''}
          />
          {
            (basicInfoValidationErrors.description_en) && (
              <p className="text-red-500 text-sm mt-1">{basicInfoValidationErrors?.description_en}</p>
            )
          }
        </div>
        <div className="flex flex-col">


          <Textarea
            id="description_ar"
            label={t('common.description_ar')}
            value={subscriptionPlanFormCtx.state.formData.basicInfo.description_ar}
            onChange={(e) => {
              subscriptionPlanFormCtx.dispatch({
                type: "SET_FORM_DATA",
                payload: { basicInfo: { ...subscriptionPlanFormCtx.state.formData.basicInfo, description_ar: e.target.value } },
              });
              const result = basicInfoSchema.safeParse({
                ...subscriptionPlanFormCtx.state.formData.basicInfo,
                description_ar: e.target.value,
              });
              if (!result.success) {
                const errors = result.error.flatten().fieldErrors;
                setBasicInfoValidationErrors(prev => ({
                  ...prev,
                  description_ar: errors.description_ar?.[0] ? t(errors.description_ar[0]) : undefined,
                }));
              } else {
                setBasicInfoValidationErrors(prev => ({
                  ...prev,
                  description_ar: undefined,
                }));
              }
            }}
            placeholder={t('common.description_ar')}
            rows={3}
            className={basicInfoValidationErrors.description_ar ? 'border-red-500' : ''}
          />
          {
            (basicInfoValidationErrors.description_ar) && (
              <p className="text-red-500 text-sm mt-1">{basicInfoValidationErrors?.description_ar}</p>
            )
          }
        </div>
        <div className="flex flex-col">


          <Textarea
            id="description_fr"
            label={t('common.description_fr')}
            value={subscriptionPlanFormCtx.state.formData.basicInfo.description_fr}
            onChange={(e) => {
              subscriptionPlanFormCtx.dispatch({
                type: "SET_FORM_DATA",
                payload: { basicInfo: { ...subscriptionPlanFormCtx.state.formData.basicInfo, description_fr: e.target.value } },
              });
              const result = basicInfoSchema.safeParse({
                ...subscriptionPlanFormCtx.state.formData.basicInfo,
                description_fr: e.target.value,
              });
              if (!result.success) {
                const errors = result.error.flatten().fieldErrors;
                setBasicInfoValidationErrors(prev => ({
                  ...prev,
                  description_fr: errors.description_fr?.[0] ? t(errors.description_fr[0]) : undefined,
                }));
              } else {
                setBasicInfoValidationErrors(prev => ({
                  ...prev,
                  description_fr: undefined,
                }));
              }
            }}
            placeholder={t('common.description_fr')}
            rows={3}
            className={basicInfoValidationErrors.description_fr ? 'border-red-500' : ''}
          />
          {
            (basicInfoValidationErrors.description_fr) && (
              <p className="text-red-500 text-sm mt-1">{basicInfoValidationErrors?.description_fr}</p>
            )
          }
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
        <div>
        <Input
          type="number"
            value={subscriptionPlanFormCtx.state.formData.basicInfo.sort_order}
            onChange={(e) => {
              subscriptionPlanFormCtx.dispatch({
                type: "SET_FORM_DATA",
                payload: { basicInfo: { ...subscriptionPlanFormCtx.state.formData.basicInfo, sort_order: e.target.value ? parseInt(e.target.value) : 0 } },
              });
              const result = basicInfoSchema.safeParse({
                ...subscriptionPlanFormCtx.state.formData.basicInfo,
                sort_order: e.target.value ? parseInt(e.target.value) : 0,
              });
              if (!result.success) {
                const errors = result.error.flatten().fieldErrors;
                setBasicInfoValidationErrors(prev => ({
                  ...prev,
                  sort_order: errors.sort_order?.[0] ? t(errors.sort_order[0]) : undefined,
                }));
              } else {
                setBasicInfoValidationErrors(prev => ({
                  ...prev,
                  sort_order: undefined,
                }));
              }
            }}
            label={t('common.plan_sort_order_label')}
            placeholder={t('common.category_name_placeholder')}
            className={basicInfoValidationErrors.sort_order ? 'border-red-500' : ''}
            required
            leftIcon={<TagIcon className="size-5" />}
          />
          {
            (basicInfoValidationErrors.sort_order) && (
              <p className="text-red-500 text-sm mt-1">{basicInfoValidationErrors?.sort_order}</p>
            )
          }
        </div>            
          <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('common.popular_plan')}
                </label>
                <Switch
              checked={subscriptionPlanFormCtx.state.formData.basicInfo.is_popular}
              onChange={(e) => {
                subscriptionPlanFormCtx.dispatch({
                  type: "SET_FORM_DATA",
                  payload: { 
                    basicInfo: { 
                      ...subscriptionPlanFormCtx.state.formData.basicInfo, 
                      is_popular: e.target.checked 
                    } 
                  },
                });
              }}
                />
              </div>
        </div>
      </div>
      <div className="mt-8 flex justify-end space-x-3">
        <Button 
          type="button" 
          className="min-w-[7rem]"
          onClick={() => setCurrentStep(0)}
        >
          Cancel
        </Button>
        <Button type="submit" className="min-w-[7rem]" color="primary">
          Next
        </Button>
      </div>
    </form>
  );
}
