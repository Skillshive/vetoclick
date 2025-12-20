// Import Dependencies
import React, { useState } from "react";
import clsx from "clsx";
import { usePage } from "@inertiajs/react";

// Local Imports
import { Page } from "@/components/shared/Page";
import { Card } from "@/components/ui";
import { ProductFormProvider } from "./ProductFormProvider.tsx";
import { Stepper } from "./Stepper.tsx";
import { ProductCreated } from "./ProductCreated";
import { BasicInfo } from "./steps/BasicInfo.tsx";
import { CategoryType } from "./steps/CategoryType.tsx";
import { MedicalDetails } from "./steps/MedicalDetails.tsx";
import { VaccineInfo } from "./steps/VaccineInfo.tsx";
import { StockStatus } from "./steps/StockStatus.tsx";
import { FormState } from "./ProductFormContext.ts";
import { useTranslation } from "@/hooks/useTranslation";
import { useLocaleContext } from "@/contexts/locale/context";
import { Product, Category } from "../datatable/types";
import { BreadcrumbItem, Breadcrumbs } from "@/components/shared/Breadcrumbs.tsx";

// ----------------------------------------------------------------------

export interface Step {
  key: keyof FormState["formData"];
  component: React.ComponentType<any>;
  label: string;
  description: string;
}

// This will be defined inside the component to access translations

interface ProductFormPageProps {
  product?: Product;
  categories: Category[];
}

const ProductForm = ({ product, categories }: ProductFormPageProps) => {
  const { t } = useTranslation();
  const { isRtl } = useLocaleContext();
  const [currentStep, setCurrentStep] = useState(0);
  const [finished, setFinished] = useState(false);
  const isEditing = !!product;

  const steps: Step[] = [
    {
      key: "basicInfo",
      component: BasicInfo,
      label: t('common.products.form.steps.basic_info.label'),
      description: t('common.products.form.steps.basic_info.description')
    },
    {
      key: "categoryType",
      component: CategoryType,
      label: t('common.products.form.steps.category_type.label'),
      description: t('common.products.form.steps.category_type.description')
    },
    {
      key: "medicalDetails",
      component: MedicalDetails,
      label: t('common.products.form.steps.medical_details.label'),
      description: t('common.products.form.steps.medical_details.description')
    },
    {
      key: "vaccineInfo",
      component: VaccineInfo,
      label: t('common.products.form.steps.vaccine_info.label'),
      description: t('common.products.form.steps.vaccine_info.description')
    },
    {
      key: "stockStatus",
      component: StockStatus,
      label: t('common.products.form.steps.stock_status.label'),
      description: t('common.products.form.steps.stock_status.description')
    }
  ];

  const ActiveForm = steps[currentStep].component;

  const stepsNode = (
    <>
      <div className={clsx("col-span-12 sm:order-last sm:col-span-4 lg:col-span-3", isRtl && "sm:order-first")}>
        <div className="sticky top-24 sm:mt-3">
          <Stepper
            steps={steps}
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
          />
        </div>
      </div>
      <div className="col-span-12 sm:col-span-8 lg:col-span-9">
        <Card className="h-full p-4 sm:p-5">
          <h5 className={clsx("dark:text-dark-100 text-lg font-medium text-gray-800", isRtl ? "text-right" : "text-left")}>
            {steps[currentStep].label}
          </h5>
          <p className={clsx("dark:text-dark-200 text-sm text-gray-500", isRtl ? "text-right" : "text-left")}>
            {steps[currentStep].description}
          </p>
          {!finished && (
            <ActiveForm
              setCurrentStep={setCurrentStep}
              setFinished={setFinished}
            />
          )}
        </Card>
      </div>
    </>
  );

  

  const breadcrumbs: BreadcrumbItem[] = [
    { title: t('common.products_breadcrumb), path: route('products.index') },
    { title: isEditing ? t('common.edit_product') : t('common.create_product')},
  ];
  return (
    <Page title={isEditing ? t('common.edit_product') : t('common.create_product')}>
      <div className={clsx("transition-content grid w-full grid-rows-[auto_1fr] px-(--margin-x) pb-8", isRtl && "rtl")} dir={isRtl ? 'rtl' : 'ltr'}>
        <div className={clsx("flex items-center gap-1", isRtl ? "flex-row-reverse" : "")}>
          <div className={isRtl ? "text-right" : "text-left"}>
            <Breadcrumbs items={breadcrumbs} className="max-sm:hidden" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isEditing ? t('common.products.form.edit_description') : t('common.products.form.create_description')}
            </p>
          </div>
        </div>
        <ProductFormProvider product={product} categories={categories}>
          <div
            className={clsx(
              "grid grid-cols-12 gap-4 sm:gap-5 lg:gap-6",
              !finished && "grid-rows-[auto_1fr] sm:grid-rows-none",
            )}
          >
            {finished ? (
              <div className="col-span-12 place-self-center">
                <ProductCreated />
              </div>
            ) : (
              stepsNode
            )}
          </div>
        </ProductFormProvider>
      </div>
    </Page>
  );
};

export default ProductForm;