// Import Dependencies
import clsx from "clsx";
import { HiCheck } from "react-icons/hi";

// Local Imports
import { createScopedKeydownHandler } from "@/utils/dom/createScopedKeydownHandler";
import {
  StepKey,
  useSubscriptionPlanFormContext,
} from "./SubscriptionPlanFormContext";

// ----------------------------------------------------------------------

export interface Step {
  key: StepKey;
  label: string;
  description: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  backendErrors?: any;
  formData?: any;
}

export function SubscriptionPlanStepper({ steps, currentStep, setCurrentStep, backendErrors, formData }: StepperProps) {
  const subscriptionPlanFormCtx = useSubscriptionPlanFormContext();
  const stepStatus = subscriptionPlanFormCtx.state.stepStatus;
  const stepKeys = Object.keys(subscriptionPlanFormCtx.state.formData) as StepKey[];

  // Function to check if a step has errors (backend or validation)
  const stepHasErrors = (stepKey: StepKey): boolean => {
    // Check backend errors first - these always show red
    if (backendErrors) {
      switch (stepKey) {
        case 'basicInfo':
          if (backendErrors.name_en || backendErrors.name_ar || backendErrors.name_fr || 
              backendErrors.description_en || backendErrors.description_ar || backendErrors.description_fr || 
              backendErrors.sort_order) {
            return true;
          }
          break;
        case 'pricing':
          if (backendErrors.price || backendErrors.yearly_price) {
            return true;
          }
          break;
        case 'features':
          if (backendErrors.selected_features) {
            return true;
          }
          break;
        case 'limits':
          if (backendErrors.max_clients || backendErrors.max_pets || backendErrors.max_appointments) {
            return true;
          }
          break;
      }
    }

    // Only show real-time validation errors if there are no backend errors
    // and the user has actually interacted with the form
    const currentFormData = formData || subscriptionPlanFormCtx.state.formData;
    
    // For now, let's disable real-time validation to prevent red on load
    // We can enable it later when we have better user interaction tracking
    return false;
  };
  
  return (
    <ol className="steps line-space text-center text-xs sm:text-start sm:text-sm is-vertical">
      {steps.map((step, i) => {
        const currentStepActualStatus = stepStatus[step.key];
        const leftSiblingStepKey = getLeftSiblingStep(step.key, stepKeys);
        const hasErrors = stepHasErrors(step.key);

        const isClickable =
          currentStepActualStatus.isDone ||
          (leftSiblingStepKey !== undefined && stepStatus[leftSiblingStepKey]?.isDone);
        return (
          <li
            className={clsx(
              "step items-center pb-8",
              currentStep > i
                ? hasErrors 
                  ? "before:bg-red-500"
                  : "before:bg-primary-500"
                : "dark:before:bg-dark-500 before:bg-gray-200",
            )}
            key={step.key}
          >
            <button
              className={clsx(
                "step-header rounded-full outline-hidden dark:text-white",
                isClickable && "cursor-pointer",
                currentStep === i && (hasErrors ? "ring-red-500 ring-2" : "ring-primary-500 ring-2"),
                hasErrors
                  ? "bg-red-600 dark:bg-red-500 dark:ring-offset-dark-900 text-white ring-offset-[3px] ring-offset-gray-100"
                  : stepStatus[step.key].isDone
                  ? "bg-primary-600 dark:bg-primary-500 dark:ring-offset-dark-900 text-white ring-offset-[3px] ring-offset-gray-100"
                  : "dark:bg-dark-500 bg-gray-200 text-gray-950",
              )}
              {...{
                onClick: isClickable
                  ? () => currentStep !== i && setCurrentStep(i)
                  : undefined,
              }}
              onKeyDown={createScopedKeydownHandler({
                siblingSelector: ".step-header",
                parentSelector: ".steps",
                loop: false,
                orientation: "vertical",
                activateOnFocus: true,
              })}
              disabled={!isClickable}
            >
              {hasErrors ? (
                <svg className="size-4.5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              ) : stepStatus[step.key].isDone ? (
                <HiCheck className="size-4.5" />
              ) : (
                i + 1
              )}
            </button>
            <h3 className={clsx(
              "sm:text-start ltr:ml-4 rtl:mr-4",
              hasErrors 
                ? "text-red-600 dark:text-red-400" 
                : "dark:text-dark-100 text-gray-800"
            )}>
              {step.label}
              {hasErrors && (
                <span className="ml-2 text-xs font-medium text-red-600 dark:text-red-400">
                  (Has errors)
                </span>
              )}
            </h3>
          </li>
        );
      })}
    </ol>
  );
}

function getLeftSiblingStep(stepKey: StepKey, keys: StepKey[]): StepKey | undefined {
  const index = keys.indexOf(stepKey);
  return index < 1 ? undefined : keys[index - 1];
}
