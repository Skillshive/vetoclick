// Import Dependencies
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import clsx from "clsx";
import { router } from "@inertiajs/react";
import { SingleValue } from "react-select";

// Local Imports
import { Button, Input, Textarea, Switch } from "@/components/ui";
import { useAppointmentFormContext } from "../AppointmentFormContext";
import { AppointmentDetailsType, appointmentDetailsSchema } from "../schema";
import { useTranslation } from "@/hooks/useTranslation";
import { useLocaleContext } from "@/contexts/locale/context";
import { useToast } from "@/Components/common/Toast/ToastContext";
import ReactSelect from "@/components/ui/ReactSelect";
import { DatePicker } from "@/components/shared/form/Datepicker";
import { 
  CalendarIcon,
  InformationCircleIcon,
  VideoCameraIcon,
  HomeIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { CalendarCogIcon } from "lucide-react";

declare const route: (name: string, params?: any, absolute?: boolean) => string;

export function AppointmentDetails({
  setCurrentStep,
  setFinished,
}: {
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  setFinished: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { showToast } = useToast();
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
    formState: { errors },
    setValue,
    watch,
    control,
    getValues,
    reset,
  } = useForm<AppointmentDetailsType>({
    resolver: zodResolver(appointmentDetailsSchema),
    defaultValues: appointmentFormCtx.state.formData.appointmentDetails,
    mode: "onChange",
  });

  const watchedValues = watch();

  // Reset form with context data when component mounts or context data changes
  // This ensures data persists when navigating back to this step
  useEffect(() => {
    reset(appointmentFormCtx.state.formData.appointmentDetails);
  }, [reset, appointmentFormCtx.state.formData.appointmentDetails]);

  // Initialize veterinary_id from context if not set in form
  useEffect(() => {
    const currentVetId = getValues('veterinary_id');
    const contextVetId = appointmentFormCtx.state.formData.appointmentDetails.veterinary_id;
    const selectedVetId = appointmentFormCtx.selectedVetId;
    
    // Set veterinary_id if it's not set but available in context or selectedVetId
    if (!currentVetId && (contextVetId || selectedVetId)) {
      const vetIdToSet = contextVetId || selectedVetId;
      if (vetIdToSet) {
        setValue('veterinary_id', vetIdToSet);
      }
    }
  }, [appointmentFormCtx.selectedVetId, appointmentFormCtx.state.formData.appointmentDetails.veterinary_id, setValue, getValues]);

  // Save to context only on unmount (when leaving the step)
  useEffect(() => {
    return () => {
      const currentValues = getValues();
      appointmentFormCtx.dispatch({
        type: "SET_FORM_DATA",
        payload: { appointmentDetails: currentValues },
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const appointmentOptions = [
    { value: "common.checkup", label: t("common.checkup") },
    { value: "common.new_patient", label: t('common.new_patient') },
    { value: "common.vaccination", label: t('common.vaccination') },
    { value: "common.surgery_consult", label: t('common.surgery_consult') },
    { value: "common.other", label: t('common.other') }
  ];

  const veterinarianOptions = appointmentFormCtx.veterinarians.map(vet => ({
    value: vet.uuid,
    label: `${vet.name}${vet.clinic ? ` - ${vet.clinic}` : ''}`,
  }));

  const selectedVeterinarianOption = watchedValues.veterinary_id
    ? veterinarianOptions.find(opt => opt.value === watchedValues.veterinary_id)
    : null;

  const onSubmit = async (data: AppointmentDetailsType) => {
    try {
      // Get all form data from context
      const { personalInfo, petInfo } = appointmentFormCtx.state.formData;
      
      if (!petInfo || !petInfo.name || !petInfo.breed_id) {
        console.error('Pet info validation failed:', {
          petInfoExists: !!petInfo,
          hasName: !!petInfo?.name,
          hasBreedId: !!petInfo?.breed_id,
          petInfo: petInfo
        });
        throw new Error('Pet information is incomplete. Please ensure pet name and breed are selected.');
      }
      
      // Step 1: Handle client creation or update
      let clientId: string = appointmentFormCtx.clientId || '';
      const veterinaryId = data.veterinary_id || appointmentFormCtx.selectedVetId;
      
      if (!clientId) {
        if (!veterinaryId) {
          throw new Error('Veterinarian must be selected before creating client');
        }
        
        const clientData = {
          first_name: personalInfo.firstname,
          last_name: personalInfo.lastname,
          email: personalInfo.email || '', // Optional - use empty string if not provided
          phone: personalInfo.phone || '', // Optional - use empty string if not provided
          address: personalInfo.address,
          city: personalInfo.city,
          postal_code: personalInfo.postal_code,
          veterinarian_id: veterinaryId, // Include veterinarian_id
        };

        const clientResponse = await fetch(route('clients.store-for-appointment'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          },
          body: JSON.stringify(clientData),
          credentials: 'same-origin',
        });

        const clientResult = await clientResponse.json();
        if (!clientResponse.ok || !clientResult.client?.uuid) {
          throw new Error(clientResult.message || 'Failed to create client');
        }
        clientId = clientResult.client.uuid;
        if (appointmentFormCtx.setClientId && clientId) {
          appointmentFormCtx.setClientId(clientId);
        }
      } else {
        if (veterinaryId) {
          const updateResponse = await fetch(route('clients.update', clientId), {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'X-Requested-With': 'XMLHttpRequest',
              'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
            body: JSON.stringify({
              veterinarian_id: veterinaryId,
            }),
            credentials: 'same-origin',
          });
          
          if (!updateResponse.ok) {
            console.warn('Failed to update client veterinarian_id, continuing...');
          }
        }
      }

      // Ensure we have a clientId
      if (!clientId) {
        throw new Error('Failed to get or create client ID');
      }

      // Step 2: Create pet
      let petId = petInfo.pet_id;
      if (!petId) {
        const petData = new FormData();
        petData.append('client_id', clientId);
        petData.append('name', petInfo.name);
        petData.append('breed_id', petInfo.breed_id);
        if (petInfo.species_id) petData.append('species_id', petInfo.species_id);
        petData.append('sex', String(petInfo.sex));
        petData.append('neutered_status', String(petInfo.neutered_status));
        petData.append('dob', petInfo.dob);
        if (petInfo.microchip_ref) petData.append('microchip_ref', petInfo.microchip_ref);
        if (petInfo.weight_kg !== undefined) petData.append('weight_kg', String(petInfo.weight_kg));
        if (petInfo.bcs !== undefined) petData.append('bcs', String(petInfo.bcs));
        if (petInfo.color) petData.append('color', petInfo.color);
        if (petInfo.notes) petData.append('notes', petInfo.notes);
        if (petInfo.profile_img) petData.append('profile_img', petInfo.profile_img);

        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        const petResponse = await fetch(route('pets.store'), {
          method: 'POST',
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'application/json',
            ...(csrfToken && { 'X-CSRF-TOKEN': csrfToken }),
          },
          body: petData,
          credentials: 'same-origin',
        });

        const petResult = await petResponse.json();
        if (!petResponse.ok || !petResult.pet?.uuid) {
          console.error('Pet creation failed:', petResult);
          throw new Error(petResult.message || JSON.stringify(petResult.errors || 'Failed to create pet'));
        }
        petId = petResult.pet.uuid;
      }

      // Step 3: Create appointment using Inertia
      const appointmentData = {
        veterinary_id: data.veterinary_id,
        client_id: clientId,
        pet_id: petId,
        appointment_type: data.appointment_type,
        appointment_date: data.appointment_date,
        start_time: data.start_time,
        is_video_conseil: data.is_video_conseil,
        reason_for_visit: data.reason_for_visit,
        appointment_notes: data.appointment_notes,
      };

      router.visit(route('appointments.create-appointment'), {
        method: 'post',
        data: appointmentData,
        onSuccess: () => {
          // Clear localStorage items used for redirect preservation
          try {
            localStorage.removeItem('pending_vet_id');
            localStorage.removeItem('pending_appointment_return_url');
          } catch (error) {
            console.warn('Could not clear localStorage:', error);
          }
          
          appointmentFormCtx.dispatch({
            type: "SET_STEP_STATUS",
            payload: {
              appointmentDetails: {
                isDone: true,
                hasErrors: false,
              },
            },
          });
          showToast({
            type: 'success',
            message: t('common.appointment_created_success'),
          });
          setFinished(true);
        },
        onError: (errors: any) => {
          console.error('Error creating appointment:', errors);
          appointmentFormCtx.dispatch({
            type: "SET_STEP_ERRORS",
            payload: { appointmentDetails: true },
          });
          showToast({
            type: 'error',
            message: t('common.appointment_create_error'),
          });
        },
      });
    } catch (error: any) {
      console.error('Error in submission process:', error);
      appointmentFormCtx.dispatch({
        type: "SET_STEP_ERRORS",
        payload: { appointmentDetails: true },
      });
      showToast({
        type: 'error',
        message: error.message || t('common.appointment_create_error'),
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
      <div className="mt-6 space-y-4">
        {/* Veterinarian Selection */}
        <ReactSelect
          id="veterinary_id"
          label={t('common.veterinarian')}
          leftIcon={<UserIcon className="h-5 w-5" />}
          value={selectedVeterinarianOption}
          onChange={(option) => {
            const selectedOption = option as SingleValue<{ value: string; label: string }>;
            if (selectedOption) {
              setValue('veterinary_id', selectedOption.value);
            } else {
              setValue('veterinary_id', '');
            }
          }}
          options={[
            { value: '', label: t('common.select_veterinarian') },
            ...veterinarianOptions
          ]}
          placeholder={t('common.select_veterinarian')}
          error={!!errors?.veterinary_id}
          isRequired={true}
        />
        {errors?.veterinary_id && (
          <p className="text-red-500 text-sm mt-1">{translateError(errors.veterinary_id.message)}</p>
        )}

        {/* Appointment Type */}
        <div>
          <label htmlFor="appointment_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {t('common.appointment_type')}
            <span className="text-red-500 mx-1">*</span>
          </label>
          <ReactSelect
            id="appointment_type"
            value={
              watchedValues.appointment_type
                ? {
                    value: watchedValues.appointment_type,
                    label: appointmentOptions?.find(appointment => appointment.value === watchedValues.appointment_type)?.label || ''
                  }
                : null
            }
            onChange={(option) => {
              const selectedOption = option as SingleValue<{ value: string; label: string }>;
              if (selectedOption) {
                setValue('appointment_type', selectedOption.value);
              } else {
                setValue('appointment_type', '');
              }
            }}
            options={[
              { value: '', label: t('common.no_appointment_type') },
              ...appointmentOptions?.map((appointment) => ({
                value: appointment.value,
                label: appointment.label
              })) || []
            ]}
            placeholder={t('common.appointment_type')}
            error={!!errors?.appointment_type}
            leftIcon={<CalendarCogIcon className="size-4.5" />}
            isRequired={true}
          />
          {errors?.appointment_type && (
            <p className="text-red-500 text-sm mt-1">{translateError(errors.appointment_type.message)}</p>
          )}
        </div>

        {/* Date and Time */}
        <div>
          <DatePicker
            value={watchedValues.appointment_date && watchedValues.start_time ? [new Date(`${watchedValues.appointment_date}T${watchedValues.start_time}`)] : []}
            onChange={(dates: Date[]) => {
              if (dates && dates.length > 0) {
                const date = dates[0];
                setValue('appointment_date', date.toISOString().split('T')[0]);
                setValue('start_time', date.toTimeString().split(' ')[0].substring(0, 5));
              } else {
                setValue('appointment_date', '');
                setValue('start_time', '');
              }
            }}
            options={{
              enableTime: true,
              dateFormat: "Y-m-d H:i",
              minDate: new Date(),
            }}
            placeholder={t('common.select_date_and_time')}
            label={t('common.date_and_time')}
            className="rounded-xl"
            required
          />
          {(errors?.appointment_date || errors?.start_time) && (
            <p className="text-red-500 text-sm mt-1">
              {translateError(errors.appointment_date?.message || errors.start_time?.message)}
            </p>
          )}
        </div>

        {/* Reason for Visit */}
        <Input
          {...register("reason_for_visit")}
          type="text"
          placeholder={t('common.reason_for_visit_placeholder')}
          label={t('common.reason_for_visit')}
          className="rounded-xl"
          prefix={<InformationCircleIcon className="size-4.5" />}
        />
        {errors?.reason_for_visit && (
          <p className="text-red-500 text-sm mt-1">{translateError(errors.reason_for_visit.message)}</p>
        )}

        {/* Video Consultation Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-600 rounded-lg border border-gray-200 dark:border-dark-500">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${watchedValues.is_video_conseil ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-200 dark:bg-dark-500'}`}>
              {watchedValues.is_video_conseil ? (
                <VideoCameraIcon className="w-5 h-5 text-primary-600 dark:text-gray-400" />
              ) : (
                <HomeIcon className="w-5 h-5 text-primary-600 dark:text-gray-400" />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-800 dark:text-dark-100">
                {watchedValues.is_video_conseil 
                  ? t('common.vet_dashboard.form.online_consultation') || 'Online Consultation'
                  : t('common.vet_dashboard.form.in_person_visit') || 'In-Person Visit'}
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {watchedValues.is_video_conseil
                  ? t('common.vet_dashboard.form.online_consultation_desc') || 'Video call appointment'
                  : t('common.vet_dashboard.form.in_person_visit_desc') || 'Physical visit to clinic'}
              </p>
            </div>
          </div>
          <Switch
            checked={watchedValues.is_video_conseil}
            onChange={(e) => setValue('is_video_conseil', e.target.checked)}
            color="primary"
            variant="basic"
          />
        </div>

        {/* Appointment Notes */}
        <div>
          <label htmlFor="appointment_notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {t('common.appointment_notes')}
          </label>
          <Textarea
            {...register("appointment_notes")}
            placeholder={t('common.appointment_notes_placeholder')}
            rows={3}
            className={errors?.appointment_notes ? 'border-red-500' : ''}
          />
          {errors?.appointment_notes && (
            <p className="text-red-500 text-sm mt-1">{translateError(errors.appointment_notes.message)}</p>
          )}
        </div>

        <div className={clsx("mt-8 flex gap-3", isRtl ? "justify-start flex-row-reverse" : "justify-end")}>
          {isRtl ? (
            <>
              <Button 
                type="submit" 
                color="primary"
              >
                {t('common.request_appointment')}
              </Button>
              <Button 
                type="button" 
                variant="outlined" 
                onClick={() => setCurrentStep((prev) => prev - 1)}
              >
                {t('common.previous')}
              </Button>
            </>
          ) : (
            <>
              <Button 
                type="button" 
                variant="outlined" 
                onClick={() => setCurrentStep((prev) => prev - 1)}
              >
                {t('common.previous')}
              </Button>
              <Button 
                type="submit" 
                color="primary"
              >
                {t('common.request_appointment')}
              </Button>
            </>
          )}
        </div>
      </div>
    </form>
  );
}

