// Import Dependencies
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { useState, useEffect } from "react";

// Local Imports
import { Button, Input } from "@/components/ui";
import { DatePicker } from "@/components/shared/form/Datepicker";
import { useProductFormContext } from "../ProductFormContext";
import { VaccineInfoType, vaccineInfoSchema } from "../schema";
import { useTranslation } from "@/hooks/useTranslation";
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
  const productFormCtx = useProductFormContext();
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

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
    reset(productFormCtx.state.formData.vaccineInfo);
  }, [productFormCtx.state.formData.vaccineInfo, reset]);

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
            label="Manufacturer"
            leftIcon={<BuildingOfficeIcon className="h-5 w-5" />}
            error={errors?.manufacturer?.message}
            placeholder="Vaccine manufacturer"
            required
          />
          <Input
            {...register("batch_number")}
            label="Batch Number"
            leftIcon={<HashtagIcon className="h-5 w-5" />}
            error={errors?.batch_number?.message}
            placeholder="Batch number"
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            name="expiry_date"
            control={control}
            render={({ field }) => (
              <DatePicker
                value={field.value || ""}
                label="Expiry Date"
                leftIcon={<CalendarIcon className="h-5 w-5" />}
                error={errors?.expiry_date?.message}
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
                }}
              />
            )}
          />
          <Input
            {...register("dosage_ml", { valueAsNumber: true })}
            type="number"
            label="Dosage (ml)"
            leftIcon={<BeakerIcon className="h-5 w-5" />}
            error={errors?.dosage_ml?.message}
            placeholder="Dosage in ml"
            step="0.1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Vaccine Instructions
          </label>
          <textarea
            {...register("vaccine_instructions")}
            rows={3}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Storage instructions, administration notes, etc."
          />
          {errors?.vaccine_instructions && (
            <p className="mt-1 text-sm text-red-600">{errors.vaccine_instructions.message}</p>
          )}
        </div>

        {/* Vaccination Schedules Section */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-gray-900 dark:text-white">
              Vaccination Schedules
            </h4>
            <Button
              type="button"
              variant="outlined"
              size="sm"
              onClick={() => setIsScheduleModalOpen(true)}
            >
              Manage Schedules
            </Button>
          </div>
          
          {productFormCtx.state.formData.vaccinationSchedules.length > 0 ? (
            <div className="space-y-2">
              {productFormCtx.state.formData.vaccinationSchedules.map((schedule, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-600 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white">
                        {schedule.name}
                      </h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Sequence: {schedule.sequence_order}
                        {schedule.age_weeks && ` • Age: ${schedule.age_weeks} weeks`}
                        {schedule.is_required && ' • Required'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-600 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No vaccination schedules configured. Click "Manage Schedules" to add them.
              </p>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-8 flex justify-between">
        <Button
          type="button"
          variant="outlined"
          onClick={onPrevious}
        >
          Previous
        </Button>
        <Button type="submit" color="primary">
          Next
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
