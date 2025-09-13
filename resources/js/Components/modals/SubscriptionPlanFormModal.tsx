import { Dialog, DialogPanel, DialogTitle,  Transition,  TransitionChild } from '@headlessui/react';
import { Button, Input, Checkbox, Select } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { SubscriptionPlan, SubscriptionPlanFormData } from '@/pages/SubscriptionPlans/types';
import { FeatureGroup, Feature } from '@/pages/FeatureGroups/types';
import { useToast } from '@/Components/common/Toast/ToastContext';
import { subscriptionPlanSchema } from '@/schemas/subscriptionPlanSchema';

declare const route: (name: string, params?: any, absolute?: boolean) => string;

interface SubscriptionPlanFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan?: SubscriptionPlan | null;
  featureGroups?: FeatureGroup[];
  allFeatures?: Feature[];
}

export default function SubscriptionPlanFormModal({ isOpen, onClose, plan, featureGroups = [], allFeatures = [] }: SubscriptionPlanFormModalProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const isEditing = !!plan;
const [processing, setProcessing] = useState(false);
  const { data, setData, post, put, reset } = useForm<SubscriptionPlanFormData>({
    name_en: '',
    name_ar: '',
    name_fr: '',
    description_en: '',
    description_ar: '',
    description_fr: '',
    features_en: [],
    features_ar: [],
    features_fr: [],
    selected_features: [],
    price: 0,
    yearly_price: 0,
    max_clients: undefined,
    max_pets: undefined,
    max_appointments: undefined,
    is_active: true,
    is_popular: false,
    sort_order: 0,
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [currentFeature, setCurrentFeature] = useState({ en: '', ar: '', fr: '' });
  useEffect(() => {
    if (plan) {
      setData({
        name_en: plan.name?.en || '',
        name_ar: plan.name?.ar || '',
        name_fr: plan.name?.fr || '',
        description_en: plan.description?.en || '',
        description_ar: plan.description?.ar || '',
        description_fr: plan.description?.fr || '',
        features_en: Array.isArray(plan.features) 
          ? plan.features.map(f => f.name?.en || f.name || '').filter(Boolean)
          : plan.features?.en || [],
        features_ar: Array.isArray(plan.features) 
          ? plan.features.map(f => f.name?.ar || f.name || '').filter(Boolean)
          : plan.features?.ar || [],
        features_fr: Array.isArray(plan.features) 
          ? plan.features.map(f => f.name?.fr || f.name || '').filter(Boolean)
          : plan.features?.fr || [],
        selected_features: Array.isArray(plan.features) 
          ? plan.features.map(f => f.uuid).filter(Boolean)
          : plan.selected_features || [],
        price: plan.price,
        yearly_price: plan.yearly_price || 0,
        max_clients: plan.max_clients || undefined,
        max_pets: plan.max_pets || undefined,
        max_appointments: plan.max_appointments || undefined,
        is_active: plan.is_active,
        is_popular: plan.is_popular,
        sort_order: plan.sort_order,
      });
    } else {
      reset();
    }
  }, [plan, setData, reset]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log('data',data)
    const result = subscriptionPlanSchema.safeParse(data);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      const newValidationErrors = {
        name_en: errors.name_en?.[0] ? t(errors.name_en[0]) : '',
        name_ar: errors.name_ar?.[0] ? t(errors.name_ar[0]) : '',
        name_fr: errors.name_fr?.[0] ? t(errors.name_fr[0]) : '',
        description_en: errors.description_en?.[0] ? t(errors.description_en[0]) : '',
        description_ar: errors.description_ar?.[0] ? t(errors.description_ar[0]) : '',
        description_fr: errors.description_fr?.[0] ? t(errors.description_fr[0]) : '',
        price: errors.price?.[0] ? t(errors.price[0]) : '',
        yearly_price: errors.yearly_price?.[0] ? t(errors.yearly_price[0]) : '',
        max_clients: errors.max_clients?.[0] ? t(errors.max_clients[0]) : '',
        max_pets: errors.max_pets?.[0] ? t(errors.max_pets[0]) : '',
        max_appointments: errors.max_appointments?.[0] ? t(errors.max_appointments[0]) : '',
        sort_order: errors.sort_order?.[0] ? t(errors.sort_order[0]) : '',
      };
      setValidationErrors(newValidationErrors);
      console.log('validationErrors', newValidationErrors);
      return;
    }

    setProcessing(true);

    if (isEditing) {
      put(route('subscription-plans.update', plan.uuid), {
        onSuccess: () => {
          showToast({
            type: 'success',
            message: t('common.plan_updated_success'),
            duration: 3000,
          });
          setValidationErrors({});
          onClose();
        },
        onError: () => {
          showToast({
            type: 'error',
            message: t('common.plan_update_error'),
            duration: 3000,
          });
        },
        onFinish: () => {
          setProcessing(false);
        },
      });
    } else {
      post(route('subscription-plans.store'), {
        onSuccess: () => {
          showToast({
            type: 'success',
            message: t('common.plan_created_success'),
            duration: 3000,
          });
          setValidationErrors({});
          onClose();
        },
        onError: () => {
          showToast({
            type: 'error',
            message: t('common.plan_create_error'),
            duration: 3000,
          });
        },
        onFinish: () => {
          setProcessing(false);
        },
      });
    }
  };

  const addFeature = () => {
    if (currentFeature.en.trim() || currentFeature.ar.trim() || currentFeature.fr.trim()) {
      setData('features_en', [...data.features_en, currentFeature.en.trim()].filter(Boolean));
      setData('features_ar', [...data.features_ar, currentFeature.ar.trim()].filter(Boolean));
      setData('features_fr', [...data.features_fr, currentFeature.fr.trim()].filter(Boolean));
      setCurrentFeature({ en: '', ar: '', fr: '' });
    }
  };

  const removeFeature = (index: number) => {
    setData('features_en', data.features_en.filter((_, i) => i !== index));
    setData('features_ar', data.features_ar.filter((_, i) => i !== index));
    setData('features_fr', data.features_fr.filter((_, i) => i !== index));
  };

  return (
    <Transition show={isOpen} as="div">
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
                    <div className="fixed inset-0 bg-black/25" />
                    </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <DialogTitle className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {isEditing ? t('common.edit_plan') : t('common.create_plan')}
                  </DialogTitle>
                  <Button
                    variant="soft"
                    color="neutral"
                    size="sm"
                    onClick={onClose}
                    className="h-8 w-8 p-0"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Plan Names */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Input
                        label={t('common.name_en')}
                        value={data.name_en}
                        onChange={(e) => setData('name_en', e.target.value)}
                        className={validationErrors.name_en ? 'border-red-500' : ''}
                        required
                      />
                      {validationErrors.name_en && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.name_en}</p>
                      )}
                    </div>
                    <div>
                      <Input
                        label={t('common.name_ar')}
                        value={data.name_ar}
                        onChange={(e) => setData('name_ar', e.target.value)}
                        className={validationErrors.name_ar ? 'border-red-500' : ''}
                        required
                      />
                      {validationErrors.name_ar && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.name_ar}</p>
                      )}
                    </div>
                    <div>
                      <Input
                        label={t('common.name_fr')}
                        value={data.name_fr}
                        onChange={(e) => setData('name_fr', e.target.value)}
                        className={validationErrors.name_fr ? 'border-red-500' : ''}
                        required
                      />
                      {validationErrors.name_fr && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.name_fr}</p>
                      )}
                    </div>
                  </div>

                  {/* Descriptions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('common.description_en')}
                      </label>
                      <textarea
                        value={data.description_en}
                        onChange={(e) => setData('description_en', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                        rows={3}
                        
                      />
                      {validationErrors.description_en && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.description_en}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('common.description_ar')}
                      </label>
                      <textarea
                        value={data.description_ar}
                        onChange={(e) => setData('description_ar', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                        rows={3}
                        
                      />
                      {validationErrors.description_ar && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.description_ar}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('common.description_fr')}
                      </label>
                      <textarea
                        value={data.description_fr}
                        onChange={(e) => setData('description_fr', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                        rows={3}
                        
                      />
                      {validationErrors.description_fr && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.description_fr}</p>
                      )}
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <Input
                        label={t('common.monthly_price')}
                        type="number"
                        step="0.01"
                        value={data.price}
                        onChange={(e) => setData('price', parseFloat(e.target.value) || 0)}
                        className={validationErrors.price ? 'border-red-500' : ''}
                        required
                      />
                      {validationErrors.price && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.price}</p>
                      )}
                    </div>
                    <div>
                      <Input
                        label={t('common.yearly_price')}
                        type="number"
                        step="0.01"
                        value={data.yearly_price || ''}
                        onChange={(e) => setData('yearly_price', parseFloat(e.target.value) || undefined)}
                        placeholder={t('common.optional')}
                        required
                      />
                      {validationErrors.yearly_price && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.yearly_price}</p>
                      )}
                    </div>
                    <div>
                      <Input
                        label={t('common.max_clients')}
                        type="number"
                        value={data.max_clients  || ''}
                        onChange={(e) => setData('max_clients', e.target.value ? parseInt(e.target.value) : undefined)}
                        placeholder={t('common.unlimited')}
                        required
                      />
                      {validationErrors.max_clients && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.max_clients}</p>
                      )}
                    </div>
                    <div>
                      <Input
                        label={t('common.max_pets')}
                        type="number"
                        value={data.max_pets || ''}
                        onChange={(e) => setData('max_pets', e.target.value ? parseInt(e.target.value) : undefined)}
                        placeholder={t('common.unlimited')}
                        required
                      />
                      {validationErrors.max_pets && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.max_pets}</p>
                      )}
                    </div>
                  </div>

                  {/* Limits */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-center">
                
                    <div>
                      <Input
                        label={t('common.max_appointments')}
                        type="number"
                        value={data.max_appointments || ''}
                        onChange={(e) => setData('max_appointments', e.target.value ? parseInt(e.target.value) : undefined)}
                        placeholder={t('common.unlimited')}
                        required
                      />
                      {validationErrors.max_appointments && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.max_appointments}</p>
                      )}
                    </div>

                    <div>
                      <Input
                        label={t('common.sort_order')}
                        type="number"
                        value={data.sort_order}
                        onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                        className={validationErrors.sort_order ? 'border-red-500' : ''}
                      />
                      {validationErrors.sort_order && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.sort_order}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-4">
                      <Checkbox
                        checked={data.is_active}
                        onChange={(e) => setData('is_active', e.target.checked)}
                        label={t('common.active')}
                      />
                      <Checkbox
                        checked={data.is_popular}
                        onChange={(e) => setData('is_popular', e.target.checked)}
                        label={t('common.popular')}
                      />
                    </div>
                  </div>

                  {/* Feature Groups Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                      {t('common.select_features')}
                    </label>
                    
                    <div className="space-y-6">
                      {featureGroups.map((group) => (
                        <div key={group.uuid} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                          <div className="flex items-center space-x-3 mb-4">
                            {group.icon && (
                              <div className={`p-2 rounded-lg bg-${group.color || 'primary'}-100 dark:bg-${group.color || 'primary'}-900`}>
                                <div className={`w-5 h-5 flex items-center justify-center text-${group.color || 'primary'}-600 dark:text-${group.color || 'primary'}-400 font-bold text-sm`}>
                                  {group.icon.charAt(0).toUpperCase()}
                                </div>
                              </div>
                            )}
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                                {typeof group.name === 'object' ? group.name.en : group.name}
                              </h4>
                              {group.description && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {typeof group.description === 'object' ? group.description.en : group.description}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {allFeatures
                              .filter(feature => feature.group_id === group.id)
                              .map((feature) => (
                                <label key={feature.uuid} className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer">
                                  <Checkbox
                                    checked={data.selected_features.includes(feature.uuid)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setData('selected_features', [...data.selected_features, feature.uuid]);
                                      } else {
                                        setData('selected_features', data.selected_features.filter(id => id !== feature.uuid));
                                      }
                                    }}
                                  />
                                  <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                      {typeof feature.name === 'object' ? feature.name.en : feature.name}
                                    </div>
                                    {feature.description && (
                                      <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {typeof feature.description === 'object' ? feature.description.en : feature.description}
                                      </div>
                                    )}
                                  </div>
                                </label>
                              ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Settings */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="soft"
                      color="neutral"
                      onClick={onClose}
                      disabled={processing}
                    >
                      {t('common.cancel')}
                    </Button>
                    <Button
                      type="submit"
                      variant="filled"
                      color="primary"
                      disabled={processing}
                    >
                      {processing
                        ? t('common.saving')
                        : isEditing
                        ? t('common.update')
                        : t('common.create')}
                    </Button>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
