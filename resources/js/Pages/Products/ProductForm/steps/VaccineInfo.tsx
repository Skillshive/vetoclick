// Import Dependencies
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { useState, useEffect } from "react";
import clsx from "clsx";

// Local Imports
import { Button, Input } from "@/components/ui";
import { DatePicker } from "@/components/shared/form/Datepicker";
import { useProductFormContext } from "../ProductFormContext";
import { VaccineInfoType, vaccineInfoSchema } from "../schema";
import { useTranslation } from "@/hooks/useTranslation";
import { useLocaleContext } from "@/contexts/locale/context";
import { VaccinationScheduleModal } from "../components/VaccinationScheduleModal";
import { 
  BuildingOfficeIcon,
  HashtagIcon,
  CalendarIcon,
  BeakerIcon
} from "@heroicons/react/24/outline";

// ----------------------------------------------------------------------

export function VaccineInfo({
  setCurrentStep,
}: {
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
}) {
  const { t } = useTranslation();
  const { isRtl } = useLocaleContext();
  const productFormCtx = useProductFormContext();
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  // Helper function to translate validation messages
  const translateError = (message: string | undefined): string | undefined => {
    if (!message) return undefined;
    if (message.startsWith('validation.')) {
      return t(message as any) || message;
    }
    return message;
  };

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
  } = useForm<VaccineInfoType>({
    resolver: zodResolver(vaccineInfoSchema),
    defaultValues: productFormCtx.state.formData.vaccineInfo,
    mode: 'onChange', // Enable real-time validation
  });

  // Reset form when context data changes
  useEffect(() => {
    const vaccineInfo = productFormCtx.state.formData.vaccineInfo;
    reset(vaccineInfo, { keepDefaultValues: false });
  }, [
    productFormCtx.state.formData.vaccineInfo.expiry_date,
    productFormCtx.state.formData.vaccineInfo.manufacturer,
    productFormCtx.state.formData.vaccineInfo.batch_number,
    productFormCtx.state.formData.vaccineInfo.dosage_ml,
    productFormCtx.state.formData.vaccineInfo.vaccine_instructions,
    reset
  ]);

  const handleSaveSchedules = (schedules: any[]) => {
    productFormCtx.dispatch({
      type: "SET_FORM_DATA",
      payload: { vaccinationSchedules: schedules },
    });
  };

  const onSubmit = (data: VaccineInfoType) => {
    saveToContext(data);
    productFormCtx.dispatch({
      type: "SET_STEP_STATUS",
      payload: { vaccineInfo: { isDone: true } },
    });
    setCurrentStep(4);
  };

  // Save data to context when form is submitted or when navigating away
  const saveToContext = (data: VaccineInfoType) => {
    productFormCtx.dispatch({
      type: "SET_FORM_DATA",
      payload: { vaccineInfo: { ...data } },
    });
  };

  // Save current form data to context when component unmounts
  useEffect(() => {
    return () => {
      const currentValues = watch();
      saveToContext(currentValues);
    };
  }, [watch]);

  const onPrevious = () => {
    setCurrentStep(2);
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
      <div className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            {...register("manufacturer")}
            label={t('common.products.form.vaccine_info.manufacturer')}
            leftIcon={<BuildingOfficeIcon className="h-5 w-5" />}
            error={translateError(errors?.manufacturer?.message)}
            placeholder={t('common.products.form.vaccine_info.manufacturer_placeholder')}
            required
          />
          <Input
            {...register("batch_number")}
            label={t('common.products.form.vaccine_info.batch_number')}
            leftIcon={<HashtagIcon className="h-5 w-5" />}
            error={translateError(errors?.batch_number?.message)}
            placeholder={t('common.products.form.vaccine_info.batch_number_placeholder')}
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            name="expiry_date"
            control={control}
            render={({ field }) => {
              // Ensure value is properly formatted string or empty
              const dateValue = field.value && typeof field.value === 'string' && field.value.trim() !== '' 
                ? field.value 
                : undefined;
              
              return (
                <DatePicker
                  key={`expiry-date-${dateValue || 'empty'}`}
                  value={dateValue}
                  label={t('common.products.form.vaccine_info.expiry_date')}
                  leftIcon={<CalendarIcon className="h-5 w-5" />}
                  error={translateError(errors?.expiry_date?.message)}
                  onChange={(date: Date[]) => {
                    // DatePicker returns Date[] even for single dates
                    if (date && date.length > 0 && date[0]) {
                      // Format as YYYY-MM-DD for backend
                      const year = date[0].getFullYear();
                      const month = String(date[0].getMonth() + 1).padStart(2, '0');
                      const day = String(date[0].getDate()).padStart(2, '0');
                      field.onChange(`${year}-${month}-${day}`);
                    } else {
                      field.onChange("");
                    }
                  }}
                  options={{
                    dateFormat: "Y-m-d",
                    allowInput: false,
                  }}
                />
              );
            }}
          />
          <Input
            {...register("dosage_ml", { valueAsNumber: true })}
            type="number"
            label={t('common.products.form.vaccine_info.dosage_ml')}
            leftIcon={<BeakerIcon className="h-5 w-5" />}
            error={translateError(errors?.dosage_ml?.message)}
            placeholder={t('common.products.form.vaccine_info.dosage_ml_placeholder')}
            step="0.1"
          />
        </div>

        <div>
          <label className={clsx("block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", isRtl ? "text-right" : "text-left")}>
            {t('common.products.form.vaccine_info.instructions')}
          </label>
          <textarea
            {...register("vaccine_instructions")}
            rows={3}
            className={clsx("w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500", isRtl && "text-right")}
            placeholder={t('common.products.form.vaccine_info.instructions_placeholder')}
            dir={isRtl ? 'rtl' : 'ltr'}
          />
            {errors?.vaccine_instructions && (
            <p className={clsx("mt-1 text-sm text-red-600", isRtl ? "text-right" : "text-left")}>{translateError(errors.vaccine_instructions.message)}</p>
          )}
        </div>

        {/* Vaccination Schedules Section */}
        <div className="mt-6">
          <div className={clsx("flex items-center justify-between mb-4", isRtl && "flex-row-reverse")}>
            <h4 className={clsx("text-md font-medium text-gray-900 dark:text-white", isRtl ? "text-right" : "text-left")}>
              {t('common.products.form.vaccine_info.schedules')}
            </h4>
            <Button
              type="button"
              variant="outlined"
              size="sm"
              onClick={() => setIsScheduleModalOpen(true)}
            >
              {t('common.products.form.vaccine_info.manage_schedules')}
            </Button>
          </div>
          
          {productFormCtx.state.formData.vaccinationSchedules.length > 0 ? (
            <div className="space-y-2">
              {productFormCtx.state.formData.vaccinationSchedules.map((schedule, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-600 rounded-lg p-3">
                  <div className={clsx("flex items-center justify-between", isRtl && "flex-row-reverse")}>
                    <div className={isRtl ? "text-right" : "text-left"}>
                      <h5 className="font-medium text-gray-900 dark:text-white">
                        {schedule.name}
                      </h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t('common.products.form.vaccine_info.sequence')}: {schedule.sequence_order}
                        {schedule.age_weeks && ` • ${t('common.products.form.vaccine_info.age')}: ${schedule.age_weeks} ${t('common.products.form.vaccine_info.weeks')}`}
                        {schedule.is_required && ` • ${t('common.products.form.vaccine_info.required')}`}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={clsx("bg-gray-50 dark:bg-gray-600 rounded-lg p-4", isRtl && "text-right")}>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('common.products.form.vaccine_info.no_schedules')}
              </p>
            </div>
          )}
        </div>
      </div>
      
      <div className={clsx("mt-8 flex gap-3", isRtl ? "justify-start" : "justify-end")}>
        <Button
          type="button"
          variant="outlined"
          onClick={onPrevious}
        >
          {t('common.previous')}
        </Button>
        <Button type="submit" color="primary">
          {t('common.next')}
        </Button>
      </div>
    </form>

    <VaccinationScheduleModal
      isOpen={isScheduleModalOpen}
      onClose={() => setIsScheduleModalOpen(false)}
      schedules={productFormCtx.state.formData.vaccinationSchedules}
      onSave={handleSaveSchedules}
    />
    </>
  );
}
