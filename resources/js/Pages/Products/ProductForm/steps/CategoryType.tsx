// Import Dependencies
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { useEffect, useCallback } from "react";
import clsx from "clsx";

// Local Imports
import { Button } from "@/components/ui";
import ReactSelect from "@/components/ui/ReactSelect";
import { useProductFormContext } from "../ProductFormContext";
import { CategoryTypeType, categoryTypeSchema } from "../schema";
import { useTranslation } from "@/hooks/useTranslation";
import { useLocaleContext } from "@/contexts/locale/context";
import { 
  FolderIcon,
  Squares2X2Icon
} from "@heroicons/react/24/outline";
import { Category } from "../../datatable/types";

// ----------------------------------------------------------------------

export function CategoryType({
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
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<CategoryTypeType>({
    resolver: zodResolver(categoryTypeSchema),
    defaultValues: productFormCtx.state.formData.categoryType,
    mode: 'onChange', // Enable real-time validation
  });

  // Reset form when context data changes
  useEffect(() => {
    reset(productFormCtx.state.formData.categoryType);
  }, [productFormCtx.state.formData.categoryType, reset]);

  const productTypeOptions = [
    { value: 1, label: t('common.products.form.category_type.medication') },
    { value: 2, label: t('common.products.form.category_type.vaccine') },
    { value: 3, label: t('common.products.form.category_type.supplement') },
    { value: 4, label: t('common.products.form.category_type.equipment') },
    { value: 5, label: t('common.products.form.category_type.food') },
  ];

  // Get categories from database via context
  const categories = productFormCtx.categories || [];
  
  // Transform categories for ReactSelect
  const categoryOptions = categories.map((category: Category) => ({
    value: category.id.toString(),
    label: category.name,
  }));

  // Save data to context when form is submitted or when navigating away
  const saveToContext = useCallback((data: CategoryTypeType) => {
    productFormCtx.dispatch({
      type: "SET_FORM_DATA",
      payload: { categoryType: { ...data } },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productFormCtx.dispatch]);

  const onSubmit = (data: CategoryTypeType) => {
    saveToContext(data);
    productFormCtx.dispatch({
      type: "SET_STEP_STATUS",
      payload: { categoryType: { isDone: true } },
    });
    
    // Skip Medical Details and Vaccine Info for food products (type 5)
    if (data.type === 5) {
      // Mark medicalDetails and vaccineInfo as done to skip them
      productFormCtx.dispatch({
        type: "SET_STEP_STATUS",
        payload: { 
          medicalDetails: { isDone: true },
          vaccineInfo: { isDone: true }
        },
      });
      setCurrentStep(4); // Go directly to StockStatus
    } else {
      setCurrentStep(2); // Go to MedicalDetails
    }
  };

  // Save current form data to context when component unmounts
  useEffect(() => {
    return () => {
      const currentValues = watch();
      saveToContext(currentValues);
    };
  }, [watch, saveToContext]);

  const onPrevious = () => {
    setCurrentStep(0);
  };

  // Get current values for ReactSelect
  const currentCategoryId = watch("category_product_id");
  const currentType = watch("type");

  // Find selected values for ReactSelect
  const selectedCategory = categoryOptions.find(opt => opt.value === currentCategoryId) || null;
  const selectedType = productTypeOptions.find(opt => opt.value === currentType) || null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
      <div className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            name="category_product_id"
            control={control}
            render={({ field }) => (
              <ReactSelect
                id="category_product_id"
                label={t('common.products.form.category_type.category')}
                leftIcon={<FolderIcon className="h-5 w-5" />}
                options={categoryOptions}
                value={selectedCategory}
                onChange={(selected) => {
                  const option = selected as { value: string; label: string } | null;
                  field.onChange(option?.value || "");
                }}
                placeholder={t('common.products.form.category_type.category_placeholder')}
                error={!!errors?.category_product_id}
                isClearable
                isRequired={true}
              />
            )}
          />

          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <ReactSelect
                id="type"
                label={t('common.products.form.category_type.type')}
                leftIcon={<Squares2X2Icon className="h-5 w-5" />}
                options={productTypeOptions}
                value={selectedType}
                onChange={(selected) => {
                  const option = selected as { value: number; label: string } | null;
                  field.onChange(option?.value || 1);
                }}
                placeholder={t('common.products.form.category_type.type_placeholder')}
                error={!!errors?.type}
                isRequired={true}
              />
            )}
          />
        </div>
        {errors?.category_product_id && (
          <p className={clsx("text-sm text-red-600 dark:text-red-400", isRtl ? "text-right" : "text-left")}>{translateError(errors.category_product_id.message)}</p>
        )}
        {errors?.type && (
          <p className={clsx("text-sm text-red-600 dark:text-red-400", isRtl ? "text-right" : "text-left")}>{translateError(errors.type.message)}</p>
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
