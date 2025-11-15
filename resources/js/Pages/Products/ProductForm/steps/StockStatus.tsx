// Import Dependencies
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";

// Local Imports
import { Button, Input, Checkbox } from "@/components/ui";
import { useProductFormContext } from "../ProductFormContext";
import { StockStatusType, stockStatusSchema } from "../schema";
import { useTranslation } from "@/hooks/useTranslation";
import { useToast } from "@/Components/common/Toast/ToastContext";
import { router, usePage } from "@inertiajs/react";
import { 
  ChartBarIcon
} from "@heroicons/react/24/outline";

declare const route: (name: string, params?: any, absolute?: boolean) => string;

// ----------------------------------------------------------------------

export function StockStatus({
  setCurrentStep,
  setFinished,
}: {
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  setFinished: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const productFormCtx = useProductFormContext();
  const isEditing = productFormCtx.isEditing || false;

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
  } = useForm<StockStatusType>({
    resolver: zodResolver(stockStatusSchema),
    defaultValues: productFormCtx.state.formData.stockStatus,
    mode: 'onChange', // Enable real-time validation
  });

  // Reset form when context data changes
  useEffect(() => {
    reset(productFormCtx.state.formData.stockStatus);
  }, [productFormCtx.state.formData.stockStatus, reset]);

  // Save data to context when form is submitted or when navigating away
  const saveToContext = (data: StockStatusType) => {
    productFormCtx.dispatch({
      type: "SET_FORM_DATA",
      payload: { stockStatus: { ...data } },
    });
  };

  // Save current form data to context when component unmounts
  useEffect(() => {
    return () => {
      const currentValues = watch();
      saveToContext(currentValues);
    };
  }, [watch]);

  const productType = productFormCtx.state.formData.categoryType.type;

  const availabilityStatusOptions = [
    { value: 1, label: 'Available' },
    { value: 2, label: 'Out of Stock' },
    { value: 3, label: 'Discontinued' },
    { value: 4, label: 'On Order' },
  ];

  const onSubmit = (data: StockStatusType) => {
    saveToContext(data);
    productFormCtx.dispatch({
      type: "SET_STEP_STATUS",
      payload: { stockStatus: { isDone: true } },
    });

    // Submit the form
    const formData = productFormCtx.state.formData;
    
    // Debug: Log all form data sections
    console.log('=== FORM DATA DEBUG ===');
    console.log('basicInfo:', formData.basicInfo);
    console.log('categoryType:', formData.categoryType);
    console.log('medicalDetails:', formData.medicalDetails);
    console.log('vaccineInfo:', formData.vaccineInfo);
    console.log('stockStatus:', data);
    console.log('vaccinationSchedules:', formData.vaccinationSchedules);
    
    const submitData = {
      ...formData.basicInfo,
      ...formData.categoryType,
      ...formData.medicalDetails,
      ...formData.vaccineInfo,
      ...data,
      vaccination_schedules: formData.vaccinationSchedules,
    };

    // Remove previewImage from submit data
    delete submitData.previewImage;
    
    // For updates: Only send fields that have actual values
    // This prevents clearing existing database values with empty strings
    if (isEditing) {
      // Remove image field if no new image was uploaded
      if (!submitData.image) {
        delete submitData.image;
      }
      
      // Remove any field that is empty string, null, or undefined
      // But keep: boolean fields, number fields (including 0), arrays, and the uuid
      Object.keys(submitData).forEach(key => {
        const value = submitData[key as keyof typeof submitData];
        
        // Skip special fields that should always be sent
        if (['vaccination_schedules', 'target_species', 'type', 'category_product_id'].includes(key)) {
          return;
        }
        
        // Skip boolean fields (prescription_required, is_active)
        if (typeof value === 'boolean') {
          return;
        }
        
        // Skip number fields that are 0 or greater (stock levels, dosage_ml, availability_status)
        if (typeof value === 'number') {
          return;
        }
        
        // Remove empty strings, null, or undefined for string fields
        if (value === '' || value === null || value === undefined) {
          delete (submitData as any)[key];
        }
      });
    } else {
      // For create operations: Convert null/undefined to empty strings
      Object.keys(submitData).forEach(key => {
        const value = submitData[key as keyof typeof submitData];
        if (value === null || value === undefined) {
          if (key !== 'image' && key !== 'dosage_ml' && key !== 'vaccination_schedules' && key !== 'target_species') {
            (submitData as any)[key] = '';
          }
        }
      });
    }
    
    // Log the submit data to debug image handling
    console.log('Submit data:', submitData);
    console.log('Image file:', submitData.image);

    // Determine if we're creating or updating
    const submitRoute = isEditing ? route('products.update', (productFormCtx.product as any)?.data?.uuid) : route('products.store');

    console.log('Submit data with image:', submitData);
    console.log('Image file:', submitData.image);
    console.log('Submit route:', submitRoute);
    console.log('Product UUID:', (productFormCtx.product as any)?.data?.uuid);

    // Submit with proper file handling
    if (isEditing) {
      // Use POST with _method spoofing for file uploads (Laravel limitation with PUT)
      router.post(submitRoute, {
        ...submitData,
        _method: 'PUT',
      }, {
        forceFormData: true,
        onSuccess: () => {
          showToast({
            type: 'success',
            message: 'Product updated successfully!',
            duration: 3000,
          });
          setFinished(true);
        },
        onError: (errors: any) => {
          console.error('Form submission errors:', errors);
          
          // Map backend errors to form steps
          const errorSteps = {
            basicInfo: false,
            categoryType: false,
            medicalDetails: false,
            vaccineInfo: false,
            stockStatus: false,
          };

          // Check which fields have errors and mark corresponding steps
          Object.keys(errors).forEach((field) => {
            if (['name', 'sku', 'brand', 'description', 'barcode', 'image'].includes(field)) {
              errorSteps.basicInfo = true;
            } else if (['category_product_id', 'type'].includes(field)) {
              errorSteps.categoryType = true;
            } else if (['dosage_form', 'administration_route', 'target_species'].includes(field)) {
              errorSteps.medicalDetails = true;
            } else if (['manufacturer', 'batch_number', 'expiry_date', 'dosage_ml', 'vaccine_instructions'].includes(field)) {
              errorSteps.vaccineInfo = true;
            } else if (['minimum_stock_level', 'maximum_stock_level', 'availability_status', 'prescription_required', 'is_active', 'notes'].includes(field)) {
              errorSteps.stockStatus = true;
            }
          });

          // Update context with error states
          productFormCtx.dispatch({
            type: "SET_STEP_ERRORS",
            payload: errorSteps,
          });

          showToast({
            type: 'error',
            message: 'Failed to save product. Please check the form for errors.',
            duration: 5000,
          });
        }
      });
    } else {
      router.post(submitRoute, submitData, {
        forceFormData: true,
        onSuccess: () => {
          showToast({
            type: 'success',
            message: 'Product created successfully!',
            duration: 3000,
          });
          setFinished(true);
        },
        onError: (errors: any) => {
          console.error('Form submission errors:', errors);
          
          // Map backend errors to form steps
          const errorSteps = {
            basicInfo: false,
            categoryType: false,
            medicalDetails: false,
            vaccineInfo: false,
            stockStatus: false,
          };

          // Check which fields have errors and mark corresponding steps
          Object.keys(errors).forEach((field) => {
            if (['name', 'sku', 'brand', 'description', 'barcode', 'image'].includes(field)) {
              errorSteps.basicInfo = true;
            } else if (['category_product_id', 'type'].includes(field)) {
              errorSteps.categoryType = true;
            } else if (['dosage_form', 'administration_route', 'target_species'].includes(field)) {
              errorSteps.medicalDetails = true;
            } else if (['manufacturer', 'batch_number', 'expiry_date', 'dosage_ml', 'vaccine_instructions'].includes(field)) {
              errorSteps.vaccineInfo = true;
            } else if (['minimum_stock_level', 'maximum_stock_level', 'availability_status', 'prescription_required', 'is_active', 'notes'].includes(field)) {
              errorSteps.stockStatus = true;
            }
          });

          // Update context with error states
          productFormCtx.dispatch({
            type: "SET_STEP_ERRORS",
            payload: errorSteps,
          });

          showToast({
            type: 'error',
            message: 'Failed to save product. Please check the form for errors.',
            duration: 5000,
          });
        }
      });
    }
  };

  const onPrevious = () => {
    const productType = productFormCtx.state.formData.categoryType.type;
    if (productType === 2) {
      setCurrentStep(3);
    } else {
      setCurrentStep(2);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
      <div className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            {...register("minimum_stock_level", { valueAsNumber: true })}
            type="number"
            label="Minimum Stock Level"
            leftIcon={<ChartBarIcon className="h-5 w-5" />}
            error={errors?.minimum_stock_level?.message}
            min="0"
          />
          <Input
            {...register("maximum_stock_level", { valueAsNumber: true })}
            type="number"
            label="Maximum Stock Level"
            leftIcon={<ChartBarIcon className="h-5 w-5" />}
            error={errors?.maximum_stock_level?.message}
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Availability Status
          </label>
          <select
            {...register("availability_status", { valueAsNumber: true })}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          >
            {availabilityStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors?.availability_status && (
            <p className="mt-1 text-sm text-red-600">{errors.availability_status.message}</p>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {/* Only show prescription required for non-equipment products */}
          {productType !== 4 && (
            <Checkbox
              {...register("prescription_required")}
              label="Prescription Required"
            />
          )}
          <Checkbox
            {...register("is_active")}
            label="Active"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Notes
          </label>
          <textarea
            {...register("notes")}
            rows={3}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Additional notes about the product..."
          />
          {errors?.notes && (
            <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
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
          {isEditing ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  );
}
