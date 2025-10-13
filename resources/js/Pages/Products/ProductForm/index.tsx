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
import { Product, Category } from "../datatable/types";

// ----------------------------------------------------------------------

export interface Step {
  key: keyof FormState["formData"];
  component: React.ComponentType<any>;
  label: string;
  description: string;
}

const steps: Step[] = [
  {
    key: "basicInfo",
    component: BasicInfo,
    label: "Basic Information",
    description: "Product name, SKU, brand, description, and image"
  },
  {
    key: "categoryType",
    component: CategoryType,
    label: "Category & Type",
    description: "Product category and type selection"
  },
  {
    key: "medicalDetails",
    component: MedicalDetails,
    label: "Medical Details",
    description: "Dosage form, administration route, and target species"
  },
  {
    key: "vaccineInfo",
    component: VaccineInfo,
    label: "Vaccine Information",
    description: "Vaccine-specific details and schedules"
  },
  {
    key: "stockStatus",
    component: StockStatus,
    label: "Stock & Status",
    description: "Stock levels, availability, and settings"
  }
];

interface ProductFormPageProps {
  product?: Product;
  categories: Category[];
}

const ProductForm = ({ product, categories }: ProductFormPageProps) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [finished, setFinished] = useState(false);
  const isEditing = !!product;

  const ActiveForm = steps[currentStep].component;

  const stepsNode = (
    <>
      <div className="col-span-12 sm:order-last sm:col-span-4 lg:col-span-3">
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
          <h5 className="dark:text-dark-100 text-lg font-medium text-gray-800">
            {steps[currentStep].label}
          </h5>
          <p className="dark:text-dark-200 text-sm text-gray-500">
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

  return (
    <Page title={isEditing ? "Edit Product" : "Create Product"}>
      <div className="transition-content grid w-full grid-rows-[auto_1fr] px-(--margin-x) pb-8">
        <h2 className="dark:text-dark-50 py-5 text-xl font-medium tracking-wide text-gray-800 lg:py-6 lg:text-2xl">
          {isEditing ? "Edit Product" : "Create New Product"}
        </h2>

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