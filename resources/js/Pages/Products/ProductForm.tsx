// Import Dependencies
import React, { useState } from "react";
import clsx from "clsx";

// Local Imports
import MainLayout from "@/layouts/MainLayout";
import { Page } from "@/components/shared/Page";
import { Card } from "@/components/ui";
import { ProductFormProvider } from "./ProductForm/ProductFormProvider.tsx";
import { useProductFormContext } from "./ProductForm/ProductFormContext.ts";
import { Stepper } from "./ProductForm/Stepper.tsx";
import { ProductCreated } from "./ProductForm/ProductCreated";
import { BasicInfo } from "./ProductForm/steps/BasicInfo.tsx";
import { CategoryType } from "./ProductForm/steps/CategoryType.tsx";
import { MedicalDetails } from "./ProductForm/steps/MedicalDetails.tsx";
import { VaccineInfo } from "./ProductForm/steps/VaccineInfo.tsx";
import { StockStatus } from "./ProductForm/steps/StockStatus.tsx";
import { FormState } from "./ProductForm/ProductFormContext.ts";
import { useTranslation } from "@/hooks/useTranslation";
import { useLocaleContext } from "@/contexts/locale/context";
import { Product, Category } from "./datatable/types";
import { BreadcrumbItem, Breadcrumbs } from "@/components/shared/Breadcrumbs.tsx";

// ----------------------------------------------------------------------

export interface Step {
  key: keyof FormState["formData"];
  component: React.ComponentType<any>;
  label: string;
  description: string;
}

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

  // All possible steps
  const allSteps: Step[] = [
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

  const breadcrumbs: BreadcrumbItem[] = [
    { title: t('common.products_breadcrumb'), path: route('products.index') },
    { title: isEditing ? t('common.edit_product') : t('common.create_product')},
  ];

  return (
    <MainLayout>
      <Page 
        title={isEditing ? t('common.metadata_titles.products_edit') : t('common.metadata_titles.products_create')}
        description={isEditing ? (t("common.page_descriptions.products_edit") || "Edit product information including details, pricing, and stock.") : (t("common.page_descriptions.products_create") || "Create a new product with details, pricing, and stock information.")}
      >
        <div className={clsx("transition-content grid w-full grid-rows-[auto_1fr] px-(--margin-x) pb-8", isRtl && "rtl")} dir={isRtl ? 'rtl' : 'ltr'}>
        <div className={clsx("flex items-center gap-1 py-4")}>
              <div className={"text-right" }>
          <Breadcrumbs items={breadcrumbs} className="max-sm:hidden" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isEditing ? t('common.products.form.edit_description') : t('common.products.form.create_description')}
          </p>
        </div>
            </div>

          <ProductFormProvider product={product} categories={categories}>
            <FormSteps 
              allSteps={allSteps}
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
              finished={finished}
              setFinished={setFinished}
              isRtl={isRtl}
            />
          </ProductFormProvider>
        </div>
      </Page>
    </MainLayout>
  );
};

// Component that has access to form context to filter steps
function FormSteps({ 
  allSteps, 
  currentStep, 
  setCurrentStep, 
  finished, 
  setFinished,
  isRtl 
}: { 
  allSteps: Step[];
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  finished: boolean;
  setFinished: React.Dispatch<React.SetStateAction<boolean>>;
  isRtl: boolean;
}) {
  const productFormCtx = useProductFormContext();
  const productType = productFormCtx.state.formData.categoryType.type;
  
  // Filter steps - hide MedicalDetails and VaccineInfo for food (type 5)
  const steps = allSteps.filter(step => {
    if (productType === 5) { // Food type
      return step.key !== 'medicalDetails' && step.key !== 'vaccineInfo';
    }
    return true;
  });

  // Auto-redirect if user is on a skipped step when product type is food
  React.useEffect(() => {
    if (productType === 5) {
      const currentStepKey = allSteps[currentStep]?.key;
      if (currentStepKey === 'medicalDetails' || currentStepKey === 'vaccineInfo') {
        // Find StockStatus step index
        const stockStatusIndex = allSteps.findIndex(step => step.key === 'stockStatus');
        if (stockStatusIndex !== -1) {
          setCurrentStep(stockStatusIndex);
        }
      }
    }
  }, [productType, currentStep, allSteps, setCurrentStep]);

  // Map currentStep to the actual step key, then find it in filtered steps
  const currentStepKey = allSteps[currentStep]?.key;
  const activeStepIndex = steps.findIndex(step => step.key === currentStepKey);
  
  // If current step is not in filtered steps (e.g., MedicalDetails or VaccineInfo for food), 
  // redirect to the next valid step
  let safeStepIndex = activeStepIndex;
  if (activeStepIndex === -1 && productType === 5) {
    // If we're on a skipped step, go to StockStatus
    safeStepIndex = steps.findIndex(step => step.key === 'stockStatus');
  } else if (activeStepIndex === -1) {
    // Fallback: go to first step
    safeStepIndex = 0;
  }
  
  const ActiveForm = steps[safeStepIndex]?.component;

  if (finished) {
    return (
      <div className="col-span-12 place-self-center">
        <ProductCreated />
      </div>
    );
  }

  return (
    <div
      className={clsx(
        "grid grid-cols-12 gap-4 sm:gap-5 lg:gap-6",
        !finished && "grid-rows-[auto_1fr] sm:grid-rows-none",
      )}
    >
      <div className={clsx("col-span-12 sm:order-last sm:col-span-4 lg:col-span-3", isRtl && "sm:order-first")}>
        <div className="sticky top-24 sm:mt-3">
          <Stepper
            steps={steps}
            currentStep={safeStepIndex}
            setCurrentStep={(newStep: number | ((prev: number) => number)) => {
              // Map filtered step index back to actual step index
              const stepValue = typeof newStep === 'function' ? newStep(safeStepIndex) : newStep;
              const clickedStep = steps[stepValue];
              if (clickedStep) {
                // Find the actual step index in allSteps
                const actualStepIndex = allSteps.findIndex(step => step.key === clickedStep.key);
                if (actualStepIndex !== -1) {
                  setCurrentStep(actualStepIndex);
                }
              }
            }}
          />
        </div>
      </div>
      <div className="col-span-12 sm:col-span-8 lg:col-span-9">
        <Card className="h-full p-4 sm:p-5">
          <h5 className={clsx("dark:text-dark-100 text-lg font-medium text-gray-800", isRtl ? "text-right" : "text-left")}>
            {steps[safeStepIndex]?.label}
          </h5>
          <p className={clsx("dark:text-dark-200 text-sm text-gray-500", isRtl ? "text-right" : "text-left")}>
            {steps[safeStepIndex]?.description}
          </p>
          {!finished && ActiveForm && (
            <ActiveForm
              setCurrentStep={setCurrentStep}
              setFinished={setFinished}
            />
          )}
        </Card>
      </div>
    </div>
  );
}

export default ProductForm;
