import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { DatePicker } from '@/components/shared/form/Datepicker';
import { Card, Button } from '@/components/ui';
import Select from 'react-select'; // Import ReactSelect
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

declare const route: (name: string, params?: any, absolute?: boolean) => string;

const schema = yup.object().shape({
  date: yup.string().required('Date is required'),
  client: yup.string().required('Client name is required'),
  pet: yup.string().required('Pet name is required'),
  appointment_type: yup.string().required('Appointment type is required'),
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
  const { t } = useTranslation();
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
    alert('Appointment Scheduled!');
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
          Schedule New Appointment
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Client Name</label>
                <Select
                  {...field}
                  options={clientOptions}
                  onChange={(selectedOption: any) => {
                    field.onChange(selectedOption ? selectedOption.value : '');
                    setSelectedClient(selectedOption ? selectedOption.value : null);
                    setValue('pet', ''); 
                  }}
                  value={clientOptions.find(option => option.value === field.value)}
                  placeholder="Select a client"
                  isClearable
                  noOptionsMessage={() => "No clients found"}
                />
                {errors.client && <p className="mt-2 text-sm text-red-600">{errors.client.message}</p>}
              </div>
            )}
          />
          <Controller
            name="pet"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Pet Name</label>
                <Select
                  {...field}
                  options={petOptions}
                  onChange={(selectedOption: any) => field.onChange(selectedOption ? selectedOption.value : '')}
                  value={petOptions.find(option => option.value === field.value)}
                  placeholder="Select a pet"
                  isClearable
                  isDisabled={!selectedClient}
                  noOptionsMessage={() => "No pets found for this client"}
                />
                {errors.pet && <p className="mt-2 text-sm text-red-600">{errors.pet.message}</p>}
              </div>
            )}
          />
          <Controller
            name="appointment_type"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Appointment Type</label>
                <Select
                  {...field}
                  options={appointmentOptions}
                  onChange={(selectedOption: any) => field.onChange(selectedOption ? selectedOption.value : '')}
                  value={appointmentOptions.find(option => option.value === field.value)}
                  placeholder="Select appointment type"
                  isClearable
                  noOptionsMessage={() => "No appointment types found"}
                />
                {errors.appointment_type && <p className="mt-2 text-sm text-red-600">{errors.appointment_type.message}</p>}
              </div>
            )}
          />
          <Button type="submit" className="w-full">
            Schedule Appointment
          </Button>
        </form>
      </div>
    </Card>
  );
};