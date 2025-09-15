// Import Dependencies
import React, { useState, useEffect } from "react";
import clsx from "clsx";
import { router } from "@inertiajs/react";

// Local Imports
import { Page } from "@/components/shared/Page";
import { Card } from "@/components/ui";
import { SubscriptionPlanFormProvider } from "./SubscriptionPlanFormProvider";
import { SubscriptionPlanStepper } from "./SubscriptionPlanStepper";
import { BasicInfo } from "./steps/BasicInfo";
import { Pricing } from "./steps/Pricing";
import { Features } from "./steps/Features";
import { Limits } from "./steps/Limits";
import { useTranslation } from "@/hooks/useTranslation";
import { useToast } from "@/components/common/Toast/ToastContext";
import { SubscriptionPlan } from "./types";
import { useForm, usePage } from "@inertiajs/react";
import { useSubscriptionPlanFormContext } from "./SubscriptionPlanFormContext";
import MainLayout from "@/layouts/MainLayout";
import { BreadcrumbItem, Breadcrumbs } from "@/components/shared/Breadcrumbs";

declare const route: (name: string, params?: any, absolute?: boolean) => string;

// ----------------------------------------------------------------------

export interface Step {
  key: "basicInfo" | "pricing" | "features" | "limits";
  component: React.ComponentType<any>;
  label: string;
  description: string;
}

const steps: Step[] = [
  {
    key: "basicInfo",
    component: BasicInfo,
    label: "Basic Information",
    description: "Enter the plan name, description, and basic settings in multiple languages",
  },
  {
    key: "pricing",
    component: Pricing,
    label: "Pricing",
    description: "Set the monthly and yearly pricing for your subscription plan",
  },
  {
    key: "features",
    component: Features,
    label: "Features",
    description: "Select and configure features available in this subscription plan",
  },
  {
    key: "limits",
    component: Limits,
    label: "Limits",
    description: "Set usage limits for clients, pets, and appointments (optional)",
  },
];

interface SubscriptionPlanFormProps {
  plan?: SubscriptionPlan | null;
  featureGroups?: any[];
  allFeatures?: any[];
  errors?: any;
}

interface StepsContentProps {
  steps: Step[];
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  finished: boolean;
  featureGroups: any[];
  allFeatures: any[];
  onFinalSubmit: () => void;
  plan?: SubscriptionPlan | null;
  isEditing: boolean;
}

const StepsContent = ({ 
  steps, 
  currentStep, 
  setCurrentStep, 
  finished, 
  featureGroups, 
  allFeatures, 
  onFinalSubmit, 
  plan, 
  isEditing, 
  errors 
}: StepsContentProps) => {
  const subscriptionPlanFormCtx = useSubscriptionPlanFormContext();
  const ActiveForm = steps[currentStep].component;

  return (
    <>
      <div className="col-span-12 sm:order-last sm:col-span-4 lg:col-span-3">
        <div className="sticky top-24 sm:mt-3">
          <SubscriptionPlanStepper
            steps={steps}
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            backendErrors={errors}
            formData={subscriptionPlanFormCtx.state.formData}
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
              featureGroups={featureGroups}
              allFeatures={allFeatures}
              onFinalSubmit={onFinalSubmit}
              plan={plan}
              isEditing={isEditing}
              backendErrors={errors}
            />
          )}
        </Card>
      </div>
    </>
  );
};

const SubscriptionPlanForm = ({ plan, featureGroups = [], allFeatures = [] ,errros}: SubscriptionPlanFormProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [finished, setFinished] = useState(false);
  const { t } = useTranslation();
  const { showToast } = useToast();
  const isEditing = !!plan;

  const { post, put, processing } = useForm();
  const { errors } = usePage().props as any;

  const ActiveForm = steps[currentStep].component;

  const handleFinalSubmit = async () => {
    setFinished(true);
  };

  const stepsNode = (
    <SubscriptionPlanFormProvider plan={plan}>
      <StepsContent 
        steps={steps}
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        finished={finished}
        featureGroups={featureGroups}
        allFeatures={allFeatures}
        onFinalSubmit={handleFinalSubmit}
        plan={plan}
        isEditing={isEditing}
        errors={errors}
      />
    </SubscriptionPlanFormProvider>
  );

  const successNode = (
    <div className="col-span-12 place-self-center">
      <Card className="p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
          <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
          {isEditing ? 'Plan Updated Successfully!' : 'Plan Created Successfully!'}
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Your subscription plan has been {isEditing ? 'updated' : 'created'} and is now ready to use.
        </p>
        <div className="mt-6">
          <button
            onClick={() => router.visit(route('subscription-plans.index'))}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            View All Plans
          </button>
        </div>
      </Card>
    </div>
  );

  const breadcrumbs: BreadcrumbItem[] = [
    { title: t('common.subscription_plans'),path: route('subscription-plans.index') },
    { title: isEditing ? t('common.edit_subscription_plan') : t('common.create_subscription_plan') },
  ];

  return (
    <MainLayout>
    <Page title={isEditing ? t('common.edit_subscription_plan') : t('common.create_subscription_plan')}>
      <div className="transition-content grid w-full grid-rows-[auto_1fr] px-(--margin-x) pb-8">
      <div className="my-5">
              <Breadcrumbs items={breadcrumbs} className="max-sm:hidden" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('common.manage_subscription_plans')}
              </p>
            </div>

        <div
          className={clsx(
            "grid grid-cols-12 gap-4 sm:gap-5 lg:gap-6",
            !finished && "grid-rows-[auto_1fr] sm:grid-rows-none",
          )}
        >
          {finished ? successNode : stepsNode}
        </div>
      </div>
    </Page>
    </MainLayout>
  );
};

export default SubscriptionPlanForm;
