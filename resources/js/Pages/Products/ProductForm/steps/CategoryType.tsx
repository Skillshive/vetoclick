// Import Dependencies
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";

// Local Imports
import { Button, Select } from "@/components/ui";
import { useProductFormContext } from "../ProductFormContext";
import { CategoryTypeType, categoryTypeSchema } from "../schema";
import { useTranslation } from "@/hooks/useTranslation";
import { router } from "@inertiajs/react";

declare const route: (name: string, params?: any, absolute?: boolean) => string;

// ----------------------------------------------------------------------

export function CategoryType({
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
    { value: 1, label: 'Medication' },
    { value: 2, label: 'Vaccine' },
    { value: 3, label: 'Supplement' },
    { value: 4, label: 'Equipment' },
  ];

  // This would normally come from props or API call
  const categories = [
    { id: 1, name: 'Medications' },
    { id: 2, name: 'Vaccines' },
    { id: 3, name: 'Supplements' },
    { id: 4, name: 'Equipment' },
  ];

  const onSubmit = (data: CategoryTypeType) => {
    saveToContext(data);
    productFormCtx.dispatch({
      type: "SET_STEP_STATUS",
      payload: { categoryType: { isDone: true } },
    });
    setCurrentStep(2);
  };

  // Save data to context when form is submitted or when navigating away
  const saveToContext = (data: CategoryTypeType) => {
    productFormCtx.dispatch({
      type: "SET_FORM_DATA",
      payload: { categoryType: { ...data } },
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
    setCurrentStep(0);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
      <div className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Product Category
            </label>
            <select
              {...register("category_product_id")}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors?.category_product_id && (
              <p className="mt-1 text-sm text-red-600">{errors.category_product_id.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Product Type
            </label>
            <select
              {...register("type", { valueAsNumber: true })}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {productTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors?.type && (
              <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
            )}
          </div>
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
  );
}
