// Import Dependencies
import clsx from "clsx";
import { HiCheck } from "react-icons/hi";
import { ExclamationCircleIcon } from "@heroicons/react/24/solid";

// Local Imports
import { useBreakpointsContext } from "@/contexts/breakpoint/context";
import { useLocaleContext } from "@/contexts/locale/context";
import { createScopedKeydownHandler } from "@/utils/dom/createScopedKeydownHandler";
import {
  StepKey,
  useAppointmentFormContext,
} from "./AppointmentFormContext";
import { Step } from "./index";

// ----------------------------------------------------------------------

interface StepperProps {
  steps: Step[];
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
}

export function Stepper({ steps, currentStep, setCurrentStep }: StepperProps) {
  const { smAndUp } = useBreakpointsContext();
  const { isRtl } = useLocaleContext();
  const appointmentFormCtx = useAppointmentFormContext();
  const stepStatus = appointmentFormCtx.state.stepStatus;
  const stepKeys = Object.keys(appointmentFormCtx.state.formData) as StepKey[];
  
  return (
    <ol
      className={clsx(
        "steps line-space text-xs sm:text-sm",
        smAndUp && "is-vertical",
        isRtl ? "text-right sm:text-end" : "text-center sm:text-start",
      )}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {steps.map((step, i) => {
        const stepKey = step.key as StepKey;
        const currentStepActualStatus = stepStatus[stepKey];
        const leftSiblingStepKey = getLeftSiblingStep(stepKey, stepKeys);

        const isClickable =
          currentStepActualStatus.isDone ||
          (leftSiblingStepKey !== undefined && stepStatus[leftSiblingStepKey as StepKey]?.isDone);
        return (
          <li
            className={clsx(
              "step",
              currentStep > i
                ? "before:bg-primary-500"
                : "dark:before:bg-dark-500 before:bg-gray-200",
              smAndUp && "items-center pb-8",
              isRtl && "flex-row-reverse"
            )}
            key={step.key}
          
          >
            <h3
              className={clsx(
                "dark:text-dark-100 text-gray-800 mx-4",
                isRtl ? "order-1" : "order-2", // RTL: text first (left), LTR: text second (right)
                smAndUp && (isRtl ? "ml-4" : "mr-4"),
                isRtl ? "text-right" : "text-left",
                currentStepActualStatus.hasErrors && "text-error dark:text-error-light font-medium",
              )}
            >
              {step.label}
            </h3>
            <button
              className={clsx(
                "step-header rounded-full outline-hidden dark:text-white relative",
                isRtl ? "order-2" : "order-1", // RTL: circle second (right), LTR: circle first (left)
                isClickable && "cursor-pointer",
                currentStep === i && "ring-2",
                currentStepActualStatus.hasErrors
                  ? "bg-error dark:bg-error-light text-white ring-error dark:ring-error-light ring-offset-[3px] ring-offset-gray-100 dark:ring-offset-dark-900"
                  : currentStepActualStatus.isDone
                  ? "bg-primary-600 dark:bg-primary-500 dark:ring-offset-dark-900 text-white ring-offset-[3px] ring-offset-gray-100 ring-primary-500"
                  : "dark:bg-dark-500 bg-gray-200 text-gray-950 ring-primary-500",
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
                orientation: smAndUp ? "vertical" : "horizontal",
                activateOnFocus: true,
              })}
              disabled={!isClickable}
            >
              {currentStepActualStatus.hasErrors ? (
                <ExclamationCircleIcon className="size-4.5" />
              ) : currentStepActualStatus.isDone ? (
                <HiCheck className="size-4.5" />
              ) : (
                i + 1
              )}
            </button>
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

