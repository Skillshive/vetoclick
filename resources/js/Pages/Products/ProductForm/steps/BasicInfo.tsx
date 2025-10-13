// Import Dependencies
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";

// Local Imports
import { Button, Input, InputErrorMsg, Upload, Avatar } from "@/components/ui";
import { useProductFormContext } from "../ProductFormContext";
import { BasicInfoType, basicInfoSchema } from "../schema";
import { PreviewImg } from "@/components/shared/PreviewImg";
import { useTranslation } from "@/hooks/useTranslation";
import { HiPencil } from "react-icons/hi";
import { PhotoIcon } from "@heroicons/react/24/outline";

// ----------------------------------------------------------------------

export function BasicInfo({
  setCurrentStep,
}: {
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
}) {
  const { t } = useTranslation();
  const productFormCtx = useProductFormContext();
  const [imageFile, setImageFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
    reset,
  } = useForm<BasicInfoType>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: productFormCtx.state.formData.basicInfo,
    mode: 'onChange', // Enable real-time validation
  });

  // Reset form when context data changes
  useEffect(() => {
    reset(productFormCtx.state.formData.basicInfo);
  }, [productFormCtx.state.formData.basicInfo, reset]);

  const watchedImage = watch("image");
  const watchedPreviewImage = watch("previewImage");

  const handleImageChange = (files: File[]) => {
    const file = files[0] || null;
    setValue("image", file);
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setValue("previewImage", e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setValue("previewImage", null);
    }
  };

  const onSubmit = (data: BasicInfoType) => {
    saveToContext(data);
    productFormCtx.dispatch({
      type: "SET_STEP_STATUS",
      payload: { basicInfo: { isDone: true } },
    });
    setCurrentStep(1);
  };

  // Save data to context when form is submitted or when navigating away
  const saveToContext = (data: BasicInfoType) => {
    productFormCtx.dispatch({
      type: "SET_FORM_DATA",
      payload: { basicInfo: { ...data } },
    });
  };

  // Save current form data to context when component unmounts
  useEffect(() => {
    return () => {
      const currentValues = watch();
      saveToContext(currentValues);
    };
  }, [watch]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
      <div className="mt-6 space-y-4">
        {/* Image Upload */}
        <div className="mt-4 flex flex-col space-y-1.5">
          <span className="dark:text-dark-100 text-base font-medium text-gray-800">
            {t('common.avatar')}
          </span>
          <div className="flex">
            <Upload
              accept="image/*"
              onChange={handleImageChange}
              className="inline-block"
            >
              {({ onClick, disabled }) => (
                <button
                  type="button"
                  onClick={onClick}
                  disabled={disabled}
                  className="focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-xl"
                >
                  <Avatar
                    size={20}
                    imgComponent={PreviewImg}
                    imgProps={{ file: imageFile || watchedImage } as any}
                    src={watchedImage ? URL.createObjectURL(watchedImage) : (watchedPreviewImage || "/assets/default/image-placeholder.jpg")}
                    classNames={{
                      root: "ring-primary-600 dark:ring-primary-500 dark:ring-offset-dark-700 rounded-xl ring-offset-[3px] ring-offset-white transition-all hover:ring-3 cursor-pointer",
                      display: "rounded-xl",
                    }}
                    indicator={
                      <div
                        className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg ring-2 ring-white dark:ring-gray-800"
                      >
                        <HiPencil className="h-3 w-3" />
                      </div>
                    }
                  />
                </button>
              )}
            </Upload>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            {...register("name")}
            label="Product Name"
            error={errors?.name?.message}
            placeholder="Enter product name"
            required
          />
          <Input
            {...register("sku")}
            label="SKU"
            error={errors?.sku?.message}
            placeholder="Enter SKU"
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            {...register("brand")}
            label="Brand"
            error={errors?.brand?.message}
            placeholder="Enter brand name"
          />
          <Input
            {...register("barcode")}
            label="Barcode"
            error={errors?.barcode?.message}
            placeholder="Enter barcode"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <textarea
            {...register("description")}
            rows={3}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Enter product description"
          />
          {errors?.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>
      </div>
      
      <div className="mt-8 flex justify-end space-x-3">
        <Button
          type="button"
          variant="outlined"
          onClick={() => window.history.back()}
        >
          Cancel
        </Button>
        <Button type="submit" color="primary">
          Next
        </Button>
      </div>
    </form>
  );
}