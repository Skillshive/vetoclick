import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DatePicker } from '@/components/shared/form/Datepicker';
import { Card, Button, Switch } from '@/components/ui';
import Select from 'react-select';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from '@/hooks/useTranslation';
import { router } from '@inertiajs/react';
import { useInertiaAuth } from '@/hooks/useInertiaAuth';
import { useToast } from '@/components/common/Toast/ToastContext';
import { vetAppointmentSchema, VetAppointmentFormValues } from '@/schemas/vetAppointmentSchema';
import { VideoCameraIcon, HomeIcon } from '@heroicons/react/24/outline';

declare const route: (name: string, params?: any, absolute?: boolean) => string;

interface Client {
  uuid: string;
  first_name: string;
  last_name: string;
}

interface Pet {
  uuid: string;
  name: string;
}

export const AppointmentForm = () => {
  const { t, isRTL } = useTranslation();
  const { user } = useInertiaAuth();
  const { showToast } = useToast();
  const isRtl = isRTL();
  const [startDate, setStartDate] = useState<Date[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const appointmentOptions = [
    { value: 'common.checkup', label: t('common.checkup') },
    { value: 'common.new_patient', label: t('common.new_patient') },
    { value: 'common.vaccination', label: t('common.vaccination') },
    { value: 'common.surgery_consult', label: t('common.surgery_consult') },
    { value: 'common.other', label: t('common.other') },
  ];

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axios.get(route('clients.all'));
        setClients(response.data);
      } catch (error) {
        console.error('Error fetching clients:', error);
      }
    };
    fetchClients();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      const fetchPets = async () => {
        try {
          const response = await axios.get(route('clients.pets', { uuid: selectedClient }));
          setPets(response.data);
        } catch (error) {
          console.error('Error fetching pets:', error);
        }
      };
      fetchPets();
    } else {
      setPets([]);
    }
  }, [selectedClient]);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<VetAppointmentFormValues>({
    resolver: zodResolver(vetAppointmentSchema),
    defaultValues: {
      appointment_date: '',
      client_id: '',
      pet_id: '',
      appointment_type: '',
      start_time: '',
      is_video_conseil: false,
      reason_for_visit: '',
      appointment_notes: '',
    },
  });

  const onSubmit = async (data: VetAppointmentFormValues) => {
    if (!startDate || startDate.length === 0 || !startDate[0]) {
      showToast({
        type: 'error',
        message: t('common.vet_dashboard.form.errors.date_required'),
        duration: 3000,
      });
      return;
    }

    console.log('user', user);
    
    // Get veterinary ID from user
    const veterinaryId = (user as any)?.veterinary?.uuid;
    if (!veterinaryId) {
      showToast({
        type: 'error',
        message: 'Veterinary information not found. Please contact support.',
        duration: 3000,
      });
      return;
    }

    setIsSubmitting(true);

    // Parse date and time from DatePicker
    const selectedDate = startDate[0];
    const appointmentDate = selectedDate.toISOString().split('T')[0];
    const startTime = selectedDate.toTimeString().split(' ')[0].substring(0, 5);

    // Prepare appointment data
    const appointmentData = {
      veterinary_id: veterinaryId,
      client_id: data.client_id,
      pet_id: data.pet_id || null,
      appointment_type: data.appointment_type,
      appointment_date: appointmentDate,
      start_time: startTime,
      is_video_conseil: Boolean(data.is_video_conseil), // Ensure it's always a boolean
      reason_for_visit: data.reason_for_visit || '',
      appointment_notes: data.appointment_notes || '',
    };

    router.post(
      route('appointments.store'),
      appointmentData,
      {
        onSuccess: () => {
          showToast({
            type: 'success',
            message: t('common.vet_dashboard.messages.appointment_scheduled'),
            duration: 3000,
          });
          // Reset form
          setValue('client_id', '');
          setValue('pet_id', '');
          setValue('appointment_type', '');
          setValue('reason_for_visit', '');
          setValue('appointment_notes', '');
          setValue('is_video_conseil', false);
          setStartDate([]);
          setSelectedClient(null);
          setIsSubmitting(false);
        },
        onError: (errors: any) => {
          const errorMessage = Object.values(errors)[0] as string || t('common.vet_dashboard.messages.appointment_error');
          showToast({
            type: 'error',
            message: errorMessage || t('common.vet_dashboard.messages.appointment_error'),
            duration: 3000,
          });
          setIsSubmitting(false);
        },
      }
    );
  };

  const clientOptions = clients.map((client) => ({
    label: `${client.first_name} ${client.last_name}`,
    value: client.uuid,
  }));

  const petOptions = pets.map((pet) => ({
    label: pet.name,
    value: pet.uuid,
  }));

  return (
    <Card className="h-fit pb-4">
      <div className="px-4 py-3">
        <h2 className="font-medium tracking-wide text-gray-800 dark:text-dark-100">
          {t('common.vet_dashboard.form.schedule_new_appointment')}
        </h2>
      </div>
      <div className="px-4 py-2">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              {t('common.vet_dashboard.form.date_and_time') || 'Date & Time'}
            </label>
            <DatePicker
              value={startDate}
              onChange={(dates: Date[]) => {
                setStartDate(dates);
                const date = dates[0];
                if (date) {
                  setValue('appointment_date', date.toISOString().split('T')[0]);
                  setValue('start_time', date.toTimeString().split(' ')[0].substring(0, 5));
                } else {
                  setValue('appointment_date', '');
                  setValue('start_time', '');
                }
              }}
              options={{
                enableTime: true,
                dateFormat: 'Y-m-d H:i',
              }}
              placeholder={t('common.vet_dashboard.form.select_date_time') || 'Select date and time'}
              className="w-full"
            />
            {errors.appointment_date && (
              <p className="mt-2 text-sm text-red-600">
                {t(String(errors.appointment_date.message))}
              </p>
            )}
          </div>
          <Controller
            name="client_id"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  {t('common.vet_dashboard.form.client_name')}
                </label>
                <Select
                  {...field}
                  options={clientOptions}
                  onChange={(selectedOption: any) => {
                    field.onChange(selectedOption ? selectedOption.value : '');
                    setSelectedClient(selectedOption ? selectedOption.value : null);
                    setValue('pet_id', ''); 
                  }}
                  value={clientOptions.find(option => option.value === field.value) || null}
                  placeholder={t('common.vet_dashboard.form.select_client')}
                  isClearable
                  noOptionsMessage={() => t('common.vet_dashboard.form.no_clients_found')}
                  isRtl={isRtl}
                />
                {errors.client_id && (
                  <p className="mt-2 text-sm text-red-600">
                    {t(String(errors.client_id.message))}
                  </p>
                )}
              </div>
            )}
          />
          <Controller
            name="pet_id"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  {t('common.vet_dashboard.form.pet_name')}
                </label>
                <Select
                  {...field}
                  options={petOptions}
                  onChange={(selectedOption: any) => field.onChange(selectedOption ? selectedOption.value : null)}
                  value={petOptions.find(option => option.value === field.value) || null}
                  placeholder={t('common.vet_dashboard.form.select_pet')}
                  isClearable
                  isDisabled={!selectedClient}
                  noOptionsMessage={() =>
                    t('common.vet_dashboard.form.no_pets_found_for_client')
                  }
                  isRtl={isRtl}
                />
                {errors.pet_id && (
                  <p className="mt-2 text-sm text-red-600">
                    {t(String(errors.pet_id.message))}
                  </p>
                )}
              </div>
            )}
          />
          <Controller
            name="appointment_type"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  {t('common.vet_dashboard.form.appointment_type')}
                </label>
                <Select
                  {...field}
                  options={appointmentOptions}
                  onChange={(selectedOption: any) => field.onChange(selectedOption ? selectedOption.value : '')}
                  value={appointmentOptions.find(option => option.value === field.value) || null}
                  placeholder={t('common.vet_dashboard.form.select_appointment_type')}
                  isClearable
                  noOptionsMessage={() =>
                    t('common.vet_dashboard.form.no_appointment_types_found')
                  }
                  isRtl={isRtl}
                />
                {errors.appointment_type && (
                  <p className="mt-2 text-sm text-red-600">
                    {t(String(errors.appointment_type.message))}
                  </p>
                )}
              </div>
            )}
          />
          <Controller
            name="is_video_conseil"
            control={control}
            render={({ field }) => (
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-600 rounded-lg border border-gray-200 dark:border-dark-500">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${field.value ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-200 dark:bg-dark-500'}`}>
                    {field.value ? (
                      <VideoCameraIcon className="w-5 h-5 text-primary-600 dark:text-gray-400" />
                    ) : (
                      <HomeIcon className="w-5 h-5 text-primary-600 dark:text-gray-400" />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800 dark:text-dark-100">
                      {field.value 
                        ? t('common.vet_dashboard.form.online_consultation') || 'Online Consultation'
                        : t('common.vet_dashboard.form.in_person_visit') || 'In-Person Visit'}
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {field.value
                        ? t('common.vet_dashboard.form.online_consultation_desc') || 'Video call appointment'
                        : t('common.vet_dashboard.form.in_person_visit_desc') || 'Physical visit to clinic'}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  color="primary"
                  variant="basic"
                />
              </div>
            )}
          />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting 
              ? t('common.submitting') || 'Submitting...' 
              : t('common.vet_dashboard.form.schedule_appointment')}
          </Button>
        </form>
      </div>
    </Card>
  );
};