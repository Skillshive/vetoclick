import React, { useEffect, useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { Button, Input, Textarea, Checkbox } from '@/components/ui';
import { useToast } from '@/Components/common/Toast/ToastContext';
import { useTranslation } from '@/hooks/useTranslation';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Product } from '@/pages/Products/datatable/types';

declare const route: (name: string, params?: any, absolute?: boolean) => string;

interface VaccinationSchedule {
  id?: number;
  uuid?: string;
  name: string;
  description: string;
  target_species: string[];
  age_weeks_min?: number;
  age_weeks_max?: number;
  is_active: boolean;
  products?: Product[];
}

interface VaccinationScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule?: VaccinationSchedule | null;
  products: Product[];
  errors?: Record<string, string>;
}

export default function VaccinationScheduleModal({ 
  isOpen, 
  onClose, 
  schedule, 
  products = [],
  errors 
}: VaccinationScheduleModalProps) {
  const { showToast } = useToast();
  const { t } = useTranslation();
  const isEditing = !!schedule;
  
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);

  const { data, setData, reset, post, put, processing } = useForm({
    name: schedule?.name || '',
    description: schedule?.description || '',
    target_species: schedule?.target_species || [],
    age_weeks_min: schedule?.age_weeks_min || '',
    age_weeks_max: schedule?.age_weeks_max || '',
    is_active: schedule?.is_active ?? true,
    product_ids: [] as number[],
  });

  const targetSpeciesOptions = [
    { value: 'dogs', label: 'Dogs' },
    { value: 'cats', label: 'Cats' },
    { value: 'horses', label: 'Horses' },
    { value: 'cattle', label: 'Cattle' },
    { value: 'birds', label: 'Birds' },
    { value: 'fish', label: 'Fish' },
  ];

  const vaccineProducts = products.filter(product => product.type === 2); // Only vaccines

  useEffect(() => {
    if (schedule) {
      setData({
        name: schedule.name,
        description: schedule.description,
        target_species: schedule.target_species || [],
        age_weeks_min: schedule.age_weeks_min || '',
        age_weeks_max: schedule.age_weeks_max || '',
        is_active: schedule.is_active ?? true,
        product_ids: schedule.products?.map(p => p.id) || [],
      });
      setSelectedProducts(schedule.products?.map(p => p.id) || []);
    } else {
      reset();
      setSelectedProducts([]);
    }
    setValidationErrors({});
  }, [schedule, isOpen, setData, reset]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    const formData = {
      ...data,
      product_ids: selectedProducts,
    };

    if (isEditing && schedule?.uuid) {
      put(route('vaccination-schedules.update', schedule.uuid), {
        data: formData,
        onSuccess: () => {
          showToast({ type: 'success', message: t('common.vaccination_schedule_updated_success') });
          onClose();
        },
        onError: (errors) => {
          setValidationErrors(errors);
          showToast({ type: 'error', message: t('common.vaccination_schedule_update_error') });
        }
      });
    } else {
      post(route('vaccination-schedules.store'), {
        data: formData,
        onSuccess: () => {
          showToast({ type: 'success', message: t('common.vaccination_schedule_created_success') });
          onClose();
        },
        onError: (errors) => {
          setValidationErrors(errors);
          showToast({ type: 'error', message: t('common.vaccination_schedule_create_error') });
        }
      });
    }
  };

  const handleProductToggle = (productId: number) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  const handleSpeciesToggle = (species: string) => {
    if (data.target_species.includes(species)) {
      setData('target_species', data.target_species.filter(s => s !== species));
    } else {
      setData('target_species', [...data.target_species, species]);
    }
  };

  return (
    <Transition appear show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white dark:bg-dark-700 p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <DialogTitle as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                    {isEditing ? t('common.edit_vaccination_schedule') : t('common.add_vaccination_schedule')}
                  </DialogTitle>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Input
                        label={t('common.schedule_name')}
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        error={validationErrors.name}
                        required
                        placeholder="e.g., Puppy Core Vaccines"
                      />
                    </div>
                    <div className="flex items-center pt-6">
                      <Checkbox
                        label={t('common.is_active')}
                        checked={data.is_active}
                        onChange={(e) => setData('is_active', e.target.checked)}
                      />
                    </div>
                  </div>

                  <div>
                    <Textarea
                      label={t('common.description')}
                      value={data.description}
                      onChange={(e) => setData('description', e.target.value)}
                      error={validationErrors.description}
                      rows={3}
                      placeholder="Description of the vaccination schedule..."
                    />
                  </div>

                  {/* Target Species */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('common.target_species')}
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {targetSpeciesOptions.map((species) => (
                        <Checkbox
                          key={species.value}
                          label={species.label}
                          checked={data.target_species.includes(species.value)}
                          onChange={() => handleSpeciesToggle(species.value)}
                        />
                      ))}
                    </div>
                    {validationErrors.target_species && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.target_species}</p>
                    )}
                  </div>

                  {/* Age Range */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Input
                        type="number"
                        label={t('common.minimum_age_weeks')}
                        value={data.age_weeks_min}
                        onChange={(e) => setData('age_weeks_min', parseInt(e.target.value))}
                        error={validationErrors.age_weeks_min}
                        placeholder="Minimum age in weeks"
                        min="0"
                      />
                    </div>
                    <div>
                      <Input
                        type="number"
                        label={t('common.maximum_age_weeks')}
                        value={data.age_weeks_max}
                        onChange={(e) => setData('age_weeks_max', parseInt(e.target.value))}
                        error={validationErrors.age_weeks_max}
                        placeholder="Maximum age in weeks"
                        min="0"
                      />
                    </div>
                  </div>

                  {/* Vaccine Products */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('common.select_vaccines')}
                    </label>
                    <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                      {vaccineProducts.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">
                          {t('common.no_vaccines_available')}
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {vaccineProducts.map((product) => (
                            <div key={product.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-600 rounded">
                              <Checkbox
                                checked={selectedProducts.includes(product.id)}
                                onChange={() => handleProductToggle(product.id)}
                              />
                              <div className="flex-1">
                                <p className="font-medium text-gray-900 dark:text-white">{product.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {product.manufacturer && `${product.manufacturer} • `}
                                  {product.batch_number && `Batch: ${product.batch_number}`}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {validationErrors.product_ids && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.product_ids}</p>
                    )}
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end space-x-3 pt-6">
                    <Button
                      type="button"
                      variant="outlined"
                      onClick={onClose}
                      disabled={processing}
                    >
                      {t('common.cancel')}
                    </Button>
                    <Button
                      type="submit"
                      color="primary"
                      disabled={processing}
                    >
                      {processing ? t('common.saving') : (isEditing ? t('common.update') : t('common.create'))}
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
