// Import Dependencies
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import clsx from "clsx";

// Local Imports
import { Button, Input, Checkbox } from "@/components/ui";
import ReactSelect from "@/components/ui/ReactSelect";
import { useProductFormContext } from "../ProductFormContext";
import { MedicalDetailsType, medicalDetailsSchema } from "../schema";
import { useTranslation } from "@/hooks/useTranslation";
import { useLocaleContext } from "@/contexts/locale/context";
import { 
  BeakerIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";

// ----------------------------------------------------------------------

export function MedicalDetails({
  setCurrentStep,
}: {
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
}) {
  const { t } = useTranslation();
  const { isRtl } = useLocaleContext();
  const productFormCtx = useProductFormContext();

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
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    reset,
  } = useForm<MedicalDetailsType>({
    resolver: zodResolver(medicalDetailsSchema),
    defaultValues: productFormCtx.state.formData.medicalDetails,
    mode: 'onChange', // Enable real-time validation
  });

  // Reset form when context data changes
  useEffect(() => {
    reset(productFormCtx.state.formData.medicalDetails);
  }, [productFormCtx.state.formData.medicalDetails, reset]);

  const productType = productFormCtx.state.formData.categoryType.type;
  const targetSpecies = watch("target_species") || [];

  const targetSpeciesOptions = [
    { value: 'dogs', label: t('common.products.form.medical_details.species.dogs') },
    { value: 'cats', label: t('common.products.form.medical_details.species.cats') },
    { value: 'horses', label: t('common.products.form.medical_details.species.horses') },
    { value: 'cattle', label: t('common.products.form.medical_details.species.cattle') },
    { value: 'birds', label: t('common.products.form.medical_details.species.birds') },
    { value: 'fish', label: t('common.products.form.medical_details.species.fish') },
  ];

  // Convert target_species array to ReactSelect format
  const selectedSpecies = targetSpecies.map(species => 
    targetSpeciesOptions.find(option => option.value === species)
  ).filter(Boolean);

  const handleSpeciesChange = (selectedOptions: any) => {
    if (Array.isArray(selectedOptions)) {
      const values = selectedOptions.map((option: any) => option.value);
      setValue("target_species", values);
    } else {
      setValue("target_species", []);
    }
  };

  const onSubmit = (data: MedicalDetailsType) => {
    saveToContext(data);
    productFormCtx.dispatch({
      type: "SET_STEP_STATUS",
      payload: { medicalDetails: { isDone: true } },
    });
    
    // Skip vaccine step if not a vaccine
    if (productType === 2) {
      setCurrentStep(3);
    } else {
      setCurrentStep(4);
    }
  };

  // Save data to context when form is submitted or when navigating away
  const saveToContext = (data: MedicalDetailsType) => {
    productFormCtx.dispatch({
      type: "SET_FORM_DATA",
      payload: { medicalDetails: { ...data } },
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
    setCurrentStep(1);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
      <div className="mt-6 space-y-4">
        {/* Only show medical fields for non-equipment products */}
        {productType !== 4 && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                {...register("dosage_form")}
                label={t('common.products.form.medical_details.dosage_form')}
                leftIcon={<BeakerIcon className="h-5 w-5" />}
                error={translateError(errors?.dosage_form?.message)}
                placeholder={t('common.products.form.medical_details.dosage_form_placeholder')}
              />
              <Input
                {...register("administration_route")}
                label={t('common.products.form.medical_details.administration_route')}
                leftIcon={<ArrowPathIcon className="h-5 w-5" />}
                error={translateError(errors?.administration_route?.message)}
                placeholder={t('common.products.form.medical_details.administration_route_placeholder')}
              />
            </div>

            {/* Target Species */}
            <div>
              <ReactSelect
                label={t('common.products.form.medical_details.target_species')}
                isMulti
                options={targetSpeciesOptions}
                value={selectedSpecies}
                onChange={handleSpeciesChange}
                error={!!errors?.target_species}
                placeholder={t('common.products.form.medical_details.target_species_placeholder')}
              />
                {errors?.target_species && (
                <p className={clsx("mt-1 text-sm text-red-600", isRtl ? "text-right" : "text-left")}>{translateError(errors.target_species.message)}</p>
              )}
            </div>
          </>
        )}

        {productType === 4 && (
          <div className={clsx("text-center py-8", isRtl && "text-right")}>
            <p className="text-gray-500 dark:text-gray-400">
              {t('common.products.form.medical_details.equipment_notice')}
            </p>
          </div>
        )}
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
  );
}
