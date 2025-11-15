// Import Dependencies
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";

// Local Imports
import { Button, Input, Checkbox } from "@/components/ui";
import ReactSelect from "@/components/ui/ReactSelect";
import { useProductFormContext } from "../ProductFormContext";
import { MedicalDetailsType, medicalDetailsSchema } from "../schema";
import { useTranslation } from "@/hooks/useTranslation";
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
  const productFormCtx = useProductFormContext();

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
    { value: 'dogs', label: 'Dogs' },
    { value: 'cats', label: 'Cats' },
    { value: 'horses', label: 'Horses' },
    { value: 'cattle', label: 'Cattle' },
    { value: 'birds', label: 'Birds' },
    { value: 'fish', label: 'Fish' },
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
                label="Dosage Form"
                leftIcon={<BeakerIcon className="h-5 w-5" />}
                error={errors?.dosage_form?.message}
                placeholder="e.g., tablet, injection, oral solution"
              />
              <Input
                {...register("administration_route")}
                label="Administration Route"
                leftIcon={<ArrowPathIcon className="h-5 w-5" />}
                error={errors?.administration_route?.message}
                placeholder="e.g., oral, topical, injection"
              />
            </div>

            {/* Target Species */}
            <div>
              <ReactSelect
                label="Target Species"
                isMulti
                options={targetSpeciesOptions}
                value={selectedSpecies}
                onChange={handleSpeciesChange}
                error={!!errors?.target_species}
                placeholder="Select target species..."
              />
              {errors?.target_species && (
                <p className="mt-1 text-sm text-red-600">{errors.target_species.message}</p>
              )}
            </div>
          </>
        )}

        {productType === 4 && (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              Medical details are not required for equipment products.
            </p>
          </div>
        )}
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
          {productType === 2 ? "Next" : "Next"}
        </Button>
      </div>
    </form>
  );
}
