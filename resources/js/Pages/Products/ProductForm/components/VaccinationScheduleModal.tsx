import React, { useState, useEffect } from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { XMarkIcon, PlusIcon, TrashIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { Button, Input } from '@/components/ui';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { vaccinationScheduleSchema, VaccinationScheduleType } from '../schema';
import { useTranslation } from '@/hooks/useTranslation';
import { useLocaleContext } from '@/contexts/locale/context';
import clsx from 'clsx';

interface VaccinationScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedules: VaccinationScheduleType[];
  onSave: (schedules: VaccinationScheduleType[]) => void;
}

export function VaccinationScheduleModal({ 
  isOpen, 
  onClose, 
  schedules, 
  onSave 
}: VaccinationScheduleModalProps) {
  const { t } = useTranslation();
  const { isRtl } = useLocaleContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedSchedules, setExpandedSchedules] = useState<Set<number>>(new Set([0]));

  // Helper function to translate validation messages
  const translateError = (message: string | undefined): string | undefined => {
    if (!message) return undefined;
    if (message.startsWith('validation.')) {
      return t(message as any) || message;
    }
    return message;
  };

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(z.object({
      schedules: z.array(vaccinationScheduleSchema)
    })),
    defaultValues: {
      schedules: schedules.length > 0 ? schedules : [{
        name: '',
        description: '',
        sequence_order: 1,
        age_weeks: null,
        is_required: true,
        notes: ''
      }]
    }
  });

  // Reset form when schedules prop changes
  useEffect(() => {
    reset({
      schedules: schedules.length > 0 ? schedules : [{
        name: '',
        description: '',
        sequence_order: 1,
        age_weeks: null,
        is_required: true,
        notes: ''
      }]
    });
  }, [schedules, reset]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'schedules'
  });

  const onSubmit = async (data: { schedules: VaccinationScheduleType[] }) => {
    setIsSubmitting(true);
    try {
      // Filter out empty schedules and validate
      const validSchedules = data.schedules.filter(schedule => 
        schedule.name && schedule.name.trim() !== ''
      );
      onSave(validSchedules);
      onClose();
    } catch (error) {
      console.error('Error saving vaccination schedules:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const addNewSchedule = () => {
    const newIndex = fields.length;
    append({
      name: '',
      description: '',
      sequence_order: newIndex + 1,
      age_weeks: null,
      is_required: true,
      notes: ''
    });
    // Expand the newly added schedule
    setExpandedSchedules(prev => new Set([...prev, newIndex]));
  };

  const toggleSchedule = (index: number) => {
    setExpandedSchedules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/25" />
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel className={clsx("w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 align-middle shadow-xl transition-all", isRtl ? "text-right" : "text-left")} dir={isRtl ? 'rtl' : 'ltr'}>
            <div className={clsx("flex items-center justify-between mb-6", isRtl && "flex-row-reverse")}>
              <DialogTitle as="h3" className={clsx("text-lg font-medium leading-6 text-gray-900 dark:text-white", isRtl ? "text-right" : "text-left")}>
                {t('common.products.form.vaccine_info.manage_schedules')}
              </DialogTitle>
              <button
                type="button"
                className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={handleClose}
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                {fields.map((field, index) => {
                  const isExpanded = expandedSchedules.has(index);
                  return (
                    <div key={field.id} className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                      <div 
                        className={clsx("flex items-center justify-between p-4 cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors", isRtl && "flex-row-reverse")}
                        onClick={() => toggleSchedule(index)}
                      >
                        <div className={clsx("flex items-center", isRtl ? "space-x-reverse space-x-3" : "space-x-3")}>
                          <ChevronDownIcon 
                            className={clsx("h-5 w-5 text-gray-500 transition-transform duration-200", isExpanded ? (isRtl ? 'transform rotate-180' : 'transform rotate-180') : '')}
                          />
                          <h4 className={clsx("text-md font-medium text-gray-900 dark:text-white", isRtl ? "text-right" : "text-left")}>
                            {t('common.products.form.vaccine_info.schedule')} {index + 1}
                          </h4>
                        </div>
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="outlined"
                            color="error"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              remove(index);
                              setExpandedSchedules(prev => {
                                const newSet = new Set(prev);
                                newSet.delete(index);
                                return newSet;
                              });
                            }}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div 
                        className={`transition-all duration-300 ease-in-out ${
                          isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                        } overflow-hidden`}
                      >
                        <div className="p-4 pt-0">

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <div>
                              <Input
                                {...control.register(`schedules.${index}.name`)}
                                label={t('common.products.form.vaccine_info.schedule_name')}
                                error={translateError(errors.schedules?.[index]?.name?.message)}
                                placeholder={t('common.products.form.vaccine_info.schedule_name_placeholder')}
                              />
                            </div>
                            <div>
                              <Input
                                {...control.register(`schedules.${index}.sequence_order`, { valueAsNumber: true })}
                                type="number"
                                label={t('common.products.form.vaccine_info.sequence_order')}
                                error={translateError(errors.schedules?.[index]?.sequence_order?.message)}
                                min="1"
                              />
                            </div>
                            <div>
                              <Input
                                {...control.register(`schedules.${index}.age_weeks`, { valueAsNumber: true })}
                                type="number"
                                label={t('common.products.form.vaccine_info.age_weeks')}
                                error={translateError(errors.schedules?.[index]?.age_weeks?.message)}
                                min="0"
                              />
                            </div>
                          </div>

                          <div className="mt-4">
                            <Input
                              {...control.register(`schedules.${index}.description`)}
                              label={t('common.products.form.vaccine_info.description')}
                              error={translateError(errors.schedules?.[index]?.description?.message)}
                              placeholder={t('common.products.form.vaccine_info.description_placeholder')}
                            />
                          </div>

                          <div className="mt-4">
                            <Input
                              {...control.register(`schedules.${index}.notes`)}
                              label={t('common.products.form.vaccine_info.notes')}
                              error={translateError(errors.schedules?.[index]?.notes?.message)}
                              placeholder={t('common.products.form.vaccine_info.notes_placeholder')}
                            />
                          </div>

                          <div className="mt-4">
                            <label className={clsx("flex items-center", isRtl && "flex-row-reverse")}>
                              <input
                                {...control.register(`schedules.${index}.is_required`)}
                                type="checkbox"
                                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                              />
                              <span className={clsx("text-sm text-gray-700 dark:text-gray-300", isRtl ? "mr-2" : "ml-2")}>
                                {t('common.products.form.vaccine_info.required_schedule')}
                              </span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className={clsx("flex justify-between", isRtl && "flex-row-reverse")}>
                <Button
                  type="button"
                  variant="outlined"
                  onClick={addNewSchedule}
                >
                  <PlusIcon className={clsx("h-4 w-4", isRtl ? "ml-2" : "mr-2")} />
                  {t('common.products.form.vaccine_info.add_schedule')}
                </Button>

                <div className={clsx("flex", isRtl ? "space-x-reverse space-x-3" : "space-x-3")}>
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={handleClose}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button
                    type="submit"
                    color="primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? t('common.saving') : t('common.products.form.vaccine_info.save_schedules')}
                  </Button>
                </div>
              </div>
            </form>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
