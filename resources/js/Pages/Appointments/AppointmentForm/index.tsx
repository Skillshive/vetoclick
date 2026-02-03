// Import Dependencies
import React, { useState, useEffect } from "react";
import clsx from "clsx";

// Local Imports
import MainLayout from "@/layouts/MainLayout";
import { Page } from "@/components/shared/Page";
import { Card } from "@/components/ui";
import { AppointmentFormProvider } from "./AppointmentFormProvider";
import { Stepper } from "./Stepper";
import { AppointmentCreated } from "./AppointmentCreated";
import { PersonalInfo } from "./steps/PersonalInfo";
import { PetInfo } from "./steps/PetInfo";
import { AppointmentDetails } from "./steps/AppointmentDetails";
import { FormState } from "./AppointmentFormContext";
import { useTranslation } from "@/hooks/useTranslation";
import { useLocaleContext } from "@/contexts/locale/context";
import { BreadcrumbItem, Breadcrumbs } from "@/components/shared/Breadcrumbs";

// ----------------------------------------------------------------------

export interface Step {
  key: keyof FormState["formData"];
  component: React.ComponentType<any>;
  label: string;
  description: string;
}

interface Veterinarian {
  id: number;
  uuid: string;
  name: string;
  clinic: string;
}

interface UserPet {
  uuid: string;
  name: string;
  breed_id: string;
  species_id?: number;
  breed_name?: string;
  species_name?: string;
  sex: number;
  neutered_status: number;
  dob: string;
  microchip_ref?: string;
  weight_kg?: number;
  bcs?: number;
  color?: string;
  notes?: string;
  profile_img?: string;
}

interface UserPersonalInfo {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  postal_code?: string;
}

interface AppointmentFormPageProps {
  veterinarians?: Veterinarian[];
  selectedVetId?: string;
  clientId?: string;
  userPersonalInfo?: UserPersonalInfo;
  userPets?: UserPet[];
  minDate?: string;
}

const AppointmentForm = ({ 
  veterinarians = [], 
  selectedVetId, 
  clientId,
  userPersonalInfo,
  userPets = [],
  minDate
}: AppointmentFormPageProps) => {
  const { t } = useTranslation();
  const { isRtl } = useLocaleContext();
  const [finished, setFinished] = useState(false);
  const [effectiveVetId, setEffectiveVetId] = useState<string | undefined>(selectedVetId);

  useEffect(() => {
    if (!selectedVetId) {
      try {
        const storedVetId = localStorage.getItem('pending_vet_id');
        if (storedVetId) {
          setEffectiveVetId(storedVetId);
          localStorage.removeItem('pending_vet_id');
          localStorage.removeItem('pending_appointment_return_url');
        }
      } catch (error) {
      }
    } else {
      setEffectiveVetId(selectedVetId);
    }
  }, [selectedVetId]);

  const allSteps: Step[] = [
    {
      key: "personalInfo",
      component: PersonalInfo,
      label: t('common.appointments.form.steps.personal_info.label') || 'Personal Information',
      description: t('common.appointments.form.steps.personal_info.description') || 'Enter your personal details',
    },
    {
      key: "petInfo",
      component: PetInfo,
      label: t('common.appointments.form.steps.pet_info.label') || 'Pet Information',
      description: t('common.appointments.form.steps.pet_info.description') || 'Add your pet details',
    },
    {
      key: "appointmentDetails",
      component: AppointmentDetails,
      label: t('common.appointments.form.steps.appointment_details.label') || 'Appointment Details',
      description: t('common.appointments.form.steps.appointment_details.description') || 'Schedule your appointment',
    },
  ];

  // If user has personal info, exclude PersonalInfo step
  const steps = userPersonalInfo 
    ? allSteps.filter(step => {
        const shouldExclude = step.key === 'personalInfo';
        return !shouldExclude;
      })
    : allSteps;

  const initialStep = userPersonalInfo ? 0 : 0;
  
  // Ensure currentStep is within bounds after filtering
  const [currentStep, setCurrentStep] = useState(initialStep);
  
  // Update currentStep if it's out of bounds (e.g., if userPersonalInfo changes)
  useEffect(() => {
    if (currentStep >= steps.length) {
      setCurrentStep(steps.length - 1);
    }
  }, [steps.length, currentStep]);

  // Ensure currentStep is valid
  const validCurrentStep = Math.min(Math.max(0, currentStep), steps.length - 1);
  const currentStepData = steps[validCurrentStep];
  const ActiveForm = currentStepData?.component;

  // Update currentStep if it's invalid
  useEffect(() => {
    if (currentStep !== validCurrentStep) {
      setCurrentStep(validCurrentStep);
    }
  }, [currentStep, validCurrentStep]);

  const stepsNode = (
    <>
      <div className={clsx("col-span-12 sm:col-span-4 lg:col-span-3", isRtl ? "sm:order-last" : "sm:order-last")}>
        <div className="sticky top-24 sm:mt-3">
          <Stepper
            steps={steps}
            currentStep={validCurrentStep}
            setCurrentStep={setCurrentStep}
          />
        </div>
      </div>
      <div className={clsx("col-span-12 sm:col-span-8 lg:col-span-9", isRtl ? "sm:order-first" : "sm:order-first")}>
        <Card className="h-full p-4 sm:p-5">
          {currentStepData && (
            <>
              <h5 className={clsx("dark:text-dark-100 text-lg font-medium text-gray-800", isRtl ? "text-right" : "text-left")}>
                {currentStepData.label}
              </h5>
              <p className={clsx("dark:text-dark-200 text-sm text-gray-500", isRtl ? "text-right" : "text-left")}>
                {currentStepData.description}
              </p>
            </>
          )}
          {!finished && ActiveForm && (
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
    { title: t('common.appointment_breadcrumb'), path: route('appointments.index') },
    { title: t('common.new_appointment')},
  ];

  return (
    <MainLayout>
      <Page 
        title={t("common.metadata_titles.appointments_create")}
        description={t("common.page_descriptions.appointments_create") || "Create a new appointment by selecting a client, pet, appointment type, and scheduling date and time."}
      >
        <div className={clsx("transition-content grid w-full grid-rows-[auto_1fr] px-(--margin-x) pb-8", isRtl && "rtl")} dir={isRtl ? 'rtl' : 'ltr'}>
          <div className={clsx("flex items-center gap-1 py-4")}>
            <div>
              <Breadcrumbs items={breadcrumbs} className="max-sm:hidden" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('common.appointments.form.create_description') || 'Create a new appointment in the system'}
              </p>
            </div>
          </div>

          <AppointmentFormProvider
            veterinarians={veterinarians}
            selectedVetId={effectiveVetId}
            clientId={clientId}
            userPersonalInfo={userPersonalInfo}
            userPets={userPets}
            minDate={minDate}
          >
            <div
              className={clsx(
                "grid grid-cols-12 gap-4 sm:gap-5 lg:gap-6",
                !finished && "grid-rows-[auto_1fr] sm:grid-rows-none",
              )}
            >
              {finished ? (
                <div className="col-span-12 place-self-center">
                  <AppointmentCreated />
                </div>
              ) : (
                stepsNode
              )}
            </div>
          </AppointmentFormProvider>
        </div>
      </Page>
    </MainLayout>
  );
};

export default AppointmentForm;

