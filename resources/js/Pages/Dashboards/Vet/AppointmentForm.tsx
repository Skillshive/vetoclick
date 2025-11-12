import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { DatePicker } from '@/components/shared/form/Datepicker';
import { Card, Button } from '@/components/ui';
import Select from 'react-select'; // Import ReactSelect
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from '@/hooks/useTranslation';

declare const route: (name: string, params?: any, absolute?: boolean) => string;

const schema = yup.object().shape({
  date: yup.string().required('common.vet_dashboard.form.errors.date_required'),
  client: yup.string().required('common.vet_dashboard.form.errors.client_required'),
  pet: yup.string().required('common.vet_dashboard.form.errors.pet_required'),
  appointment_type: yup
    .string()
    .required('common.vet_dashboard.form.errors.appointment_type_required'),
});

interface Client {
  uuid: string;
  first_name: string;
  last_name: string;
}

interface Pet {
  id: string;
  name: string;
}

export const AppointmentForm = () => {
  const { t, isRTL } = useTranslation();
  const isRtl = isRTL();
  const [startDate, setStartDate] = useState(new Date());
  const [clients, setClients] = useState<Client[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);

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
    setValue, // Add setValue to manually set form values
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      date: '',
      client: '',
      pet: '',
      appointment_type: '',
    },
  });

  const onSubmit = (data: any) => {
    console.log(data);
    alert(t('common.vet_dashboard.messages.appointment_scheduled'));
  };

  const clientOptions = clients.map((client) => ({
    label: `${client.first_name} ${client.last_name}`,
    value: client.uuid,
  }));

  const petOptions = pets.map((pet) => ({
    label: pet.name,
    value: pet.id,
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
          <DatePicker
            id="appointment_date"
            value={startDate}
            onChange={(dates) => setStartDate(dates[0])}
            options={{
              enableTime: true,
              dateFormat: 'Y-m-d H:i',
            }}
            className="w-full"
          />
          <Controller
            name="client"
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
                    setValue('pet', ''); 
                  }}
                  value={clientOptions.find(option => option.value === field.value)}
                  placeholder={t('common.vet_dashboard.form.select_client')}
                  isClearable
                  noOptionsMessage={() => t('common.vet_dashboard.form.no_clients_found')}
                  isRtl={isRtl}
                />
                {errors.client && (
                  <p className="mt-2 text-sm text-red-600">
                    {t(String(errors.client.message))}
                  </p>
                )}
              </div>
            )}
          />
          <Controller
            name="pet"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  {t('common.vet_dashboard.form.pet_name')}
                </label>
                <Select
                  {...field}
                  options={petOptions}
                  onChange={(selectedOption: any) => field.onChange(selectedOption ? selectedOption.value : '')}
                  value={petOptions.find(option => option.value === field.value)}
                  placeholder={t('common.vet_dashboard.form.select_pet')}
                  isClearable
                  isDisabled={!selectedClient}
                  noOptionsMessage={() =>
                    t('common.vet_dashboard.form.no_pets_found_for_client')
                  }
                  isRtl={isRtl}
                />
                {errors.pet && (
                  <p className="mt-2 text-sm text-red-600">
                    {t(String(errors.pet.message))}
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
                  value={appointmentOptions.find(option => option.value === field.value)}
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
          <Button type="submit" className="w-full">
            {t('common.vet_dashboard.form.schedule_appointment')}
          </Button>
        </form>
      </div>
    </Card>
  );
};