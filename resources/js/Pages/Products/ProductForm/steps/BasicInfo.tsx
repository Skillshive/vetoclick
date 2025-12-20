// Import Dependencies
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import clsx from "clsx";

// Local Imports
import { Button, Input, Upload, Avatar, Textarea } from "@/components/ui";
import { useProductFormContext } from "../ProductFormContext";
import { BasicInfoType, basicInfoSchema } from "../schema";
import { PreviewImg } from "@/components/shared/PreviewImg";
import { useTranslation } from "@/hooks/useTranslation";
import { useLocaleContext } from "@/contexts/locale/context";
import { HiPencil } from "react-icons/hi";
import { 
  TagIcon,
  CubeIcon,
  BuildingOfficeIcon,
  BarsArrowUpIcon
} from "@heroicons/react/24/outline";

// ----------------------------------------------------------------------

export function BasicInfo({
  setCurrentStep,
}: {
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
}) {
  const { t } = useTranslation();
  const { isRtl } = useLocaleContext();
  const productFormCtx = useProductFormContext();
  const [imageFile, setImageFile] = useState<File | null>(null);

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

  // Save data to context when form is submitted or when navigating away
  const saveToContext = (data: BasicInfoType) => {
    console.log('BasicInfo - Saving to context:', data);
    productFormCtx.dispatch({
      type: "SET_FORM_DATA",
      payload: { basicInfo: { ...data } },
    });
  };

  const onSubmit = (data: BasicInfoType) => {
    console.log('BasicInfo - Form submitted:', data);
    saveToContext(data);
    productFormCtx.dispatch({
      type: "SET_STEP_STATUS",
      payload: { basicInfo: { isDone: true } },
    });
    setCurrentStep(1);
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
          <span className={clsx("dark:text-dark-100 text-base font-medium text-gray-800", isRtl ? "text-right" : "text-left")}>
            {t('common.products.form.basic_info.image')}
          </span>
          <div className="flex">
          <Upload
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
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
                        className={clsx("absolute flex h-6 w-6 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg ring-2 ring-white dark:ring-gray-800", isRtl ? "-bottom-1 -left-1" : "-bottom-1 -right-1")}
                      >
                        <HiPencil className="h-3 w-3" />
                      </div>
                    }
                  />
                </button>
              )}
            </Upload>
          </div>
            {errors?.image && (
            <p className={clsx("mt-1 text-sm text-red-600", isRtl ? "text-right" : "text-left")}>{translateError(errors.image.message)}</p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            {...register("name")}
            label={t('common.products.form.basic_info.product_name')}
            leftIcon={<TagIcon className="h-5 w-5" />}
            error={translateError(errors?.name?.message)}
            placeholder={t('common.products.form.basic_info.product_name_placeholder')}
            required
          />
          <Input
            {...register("sku")}
            label={t('common.products.form.basic_info.sku')}
            leftIcon={<CubeIcon className="h-5 w-5" />}
            error={translateError(errors?.sku?.message)}
            placeholder={t('common.products.form.basic_info.sku_placeholder')}
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            {...register("brand")}
            label={t('common.products.form.basic_info.brand')}
            leftIcon={<BuildingOfficeIcon className="h-5 w-5" />}
            error={translateError(errors?.brand?.message)}
            placeholder={t('common.products.form.basic_info.brand_placeholder')}
          />
          <Input
            {...register("barcode")}
            label={t('common.products.form.basic_info.barcode')}
            leftIcon={<BarsArrowUpIcon className="h-5 w-5" />}
            error={translateError(errors?.barcode?.message)}
            placeholder={t('common.products.form.basic_info.barcode_placeholder')}
          />
        </div>

        <div>
          <label className={clsx("block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", isRtl ? "text-right" : "text-left")}>
            {t('common.products.form.basic_info.description')}
          </label>
          <Textarea
            {...register("description")}
            rows={3}
            className={clsx("w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500", isRtl && "text-right")}
            placeholder={t('common.products.form.basic_info.description_placeholder')}
            dir={isRtl ? 'rtl' : 'ltr'}
          />
          {errors?.description && (
            <p className={clsx("mt-1 text-sm text-red-600", isRtl ? "text-right" : "text-left")}>{translateError(errors.description.message)}</p>
          )}
        </div>
      </div>
      
      <div className={clsx("mt-8 flex gap-3", isRtl ? "justify-start" : "justify-end")}>
        <Button
          type="button"
          variant="outlined"
          onClick={() => window.history.back()}
        >
          {t('common.cancel')}
        </Button>
        <Button type="submit" color="primary">
          {t('common.next')}
        </Button>
      </div>
    </form>
  );
}