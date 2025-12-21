// Import Dependencies
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import clsx from "clsx";

declare const route: (name: string, params?: any, absolute?: boolean) => string;

// Local Imports
import { Button, Input } from "@/components/ui";
import { useAppointmentFormContext } from "../AppointmentFormContext";
import { PersonalInfoType, personalInfoSchema } from "../schema";
import { useTranslation } from "@/hooks/useTranslation";
import { useLocaleContext } from "@/contexts/locale/context";
import { 
  UserIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";

// ----------------------------------------------------------------------

export function PersonalInfo({
  setCurrentStep,
}: {
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
}) {
  const { t } = useTranslation();
  const { isRtl } = useLocaleContext();
  const appointmentFormCtx = useAppointmentFormContext();

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
    getValues,
    reset,
  } = useForm<PersonalInfoType>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      ...appointmentFormCtx.state.formData.personalInfo,
      email: appointmentFormCtx.state.formData.personalInfo.email || '',
      phone: appointmentFormCtx.state.formData.personalInfo.phone || '',
    },
    mode: "onChange",
  });

  // Reset form with context data when component mounts or context data changes
  // This ensures data persists when navigating back to this step
  useEffect(() => {
    const formData = {
      ...appointmentFormCtx.state.formData.personalInfo,
      email: appointmentFormCtx.state.formData.personalInfo.email || '',
      phone: appointmentFormCtx.state.formData.personalInfo.phone || '',
    };
    reset(formData);
    // Set email and phone to empty strings since they're not in the form UI
    setValue('email', '');
    setValue('phone', '');
  }, [reset, setValue, appointmentFormCtx.state.formData.personalInfo]);

  const watchedValues = watch();

  // Save to context only on unmount (when leaving the step)
  useEffect(() => {
    return () => {
      const currentValues = getValues();
      appointmentFormCtx.dispatch({
        type: "SET_FORM_DATA",
        payload: { personalInfo: currentValues },
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = (data: PersonalInfoType) => {
    // Save personal info to context
    appointmentFormCtx.dispatch({
      type: "SET_FORM_DATA",
      payload: { personalInfo: data },
    });

    appointmentFormCtx.dispatch({
      type: "SET_STEP_STATUS",
      payload: {
        personalInfo: {
          isDone: true,
          hasErrors: false,
        },
      },
    });
    
    setCurrentStep(1); // Move to Pet Info step
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
      <div className="mt-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            {...register("firstname")}
            label={t('common.firstname')}
            leftIcon={<UserIcon className="h-5 w-5" />}
            error={translateError(errors?.firstname?.message)}
            placeholder={t('common.firstname_placeholder')}
            required
          />
          <Input
            {...register("lastname")}
            label={t('common.lastname')}
            leftIcon={<UserIcon className="h-5 w-5" />}
            error={translateError(errors?.lastname?.message)}
            placeholder={t('common.lastname_placeholder')}
            required
          />
        </div>

        <Input
          {...register("address")}
          label={t('common.address')}
          leftIcon={<MapPinIcon className="h-5 w-5" />}
          error={translateError(errors?.address?.message)}
          placeholder={t('common.address_placeholder')}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            {...register("city")}
            label={t('common.city')}
            leftIcon={<MapPinIcon className="h-5 w-5" />}
            error={translateError(errors?.city?.message)}
            placeholder={t('common.city_placeholder')}
          />
          <Input
            {...register("postal_code")}
            label={t('common.postal_code')}
            leftIcon={<MapPinIcon className="h-5 w-5" />}
            error={translateError(errors?.postal_code?.message)}
            placeholder={t('common.postal_code_placeholder')}
          />
        </div>

        <div className={clsx("mt-8 flex justify-end gap-3", isRtl && "flex-row-reverse")}>
          <Button type="submit" color="primary">
            {t('common.next')}
          </Button>
        </div>
      </div>
    </form>
  );
}

