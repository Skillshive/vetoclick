import MainLayout from '@/layouts/MainLayout';
import React, { useState, useEffect } from 'react';
import { router, useForm, usePage } from '@inertiajs/react';
import { Button, Card, Input, Textarea, Switch } from '@/components/ui';
import { useToast } from '@/components/common/Toast/ToastContext';
import { appointmentSchema, AppointmentFormValues } from '@/schemas/appointmentSchema';
import { useTranslation } from '@/hooks/useTranslation';
import { CalendarIcon, InformationCircleIcon, VideoCameraIcon, HomeIcon, UserIcon } from '@heroicons/react/24/outline';
import { DatePicker } from '@/components/shared/form/Datepicker';
import { Page } from '@/components/shared/Page';
import { BreadcrumbItem, Breadcrumbs } from '@/components/shared/Breadcrumbs';
import ReactSelect from '@/components/ui/ReactSelect';
import { CalendarCogIcon } from 'lucide-react';

// Declare route helper
declare const route: (name: string, params?: any, absolute?: boolean) => string;

interface Veterinarian {
    id: number;
    uuid: string;
    name: string;
    clinic: string;
}

interface CreateAppointmentPageProps {
    veterinarians?: Veterinarian[];
    selectedVetId?: string;
    clientId?: string;
    minDate?: string;
}

const CreateAppointment: React.FC = () => {
    const { showToast } = useToast();
    const { t } = useTranslation();
    const { props } = usePage<CreateAppointmentPageProps>();
    const { veterinarians = [], selectedVetId, clientId, minDate } = props;
    const [validationErrors, setValidationErrors] = useState<Partial<Record<keyof AppointmentFormValues, string>>>({});

    // Find the selected veterinarian by UUID
    const selectedVet = selectedVetId 
        ? veterinarians.find(vet => vet.uuid === selectedVetId)
        : null;

    const { data, setData, post, processing, errors, reset } = useForm<AppointmentFormValues>({
        appointment_type: 'Check-up',
        appointment_date: '',
        start_time: '',
        is_video_conseil: false,
        reason_for_visit: '',
        appointment_notes: '',
        veterinary_id: selectedVet?.uuid || '',
        pet_id: '',
        client_id: clientId || '', // Add client_id from auth user
    });

    // Update veterinary_id when selectedVetId changes
    useEffect(() => {
        if (selectedVet) {
            setData('veterinary_id', selectedVet.uuid);
        }
    }, [selectedVetId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const result = appointmentSchema.safeParse(data);
        if (!result.success) {
            const errors = result.error.flatten().fieldErrors;
            const newErrors: Partial<Record<keyof AppointmentFormValues, string>> = {};
            for (const key in errors) {
                newErrors[key as keyof AppointmentFormValues] = t(errors[key]![0]);
            }
            setValidationErrors(newErrors);
            return;
        }

        post(route('appointments.create-appointment'), {
            onSuccess: () => {
                showToast({
                    type: 'success',
                    message: t('common.appointment_created_success'),
                    duration: 3000,
                });
                reset();
                setValidationErrors({});
                router.visit(route('appointments.index'));
            },
            onError: (errors: Record<string, string>) => {
                const newErrors: Partial<Record<keyof AppointmentFormValues, string>> = {};
                for (const key in errors) {
                    if (key in appointmentSchema.shape) {
                        newErrors[key as keyof AppointmentFormValues] = t(errors[key]!);
                    }
                }
                setValidationErrors(newErrors);
                showToast({
                    type: 'error',
                    message: t('common.appointment_create_error'),
                    duration: 3000,
                });
            }
        });
    };

      const breadcrumbs: BreadcrumbItem[] = [
        { title: t('common.appointment_breadcrumb'), path: route('appointments.index') },
        { title: t('common.new_appointment')},
      ]; 


      const appointmentOptions = [
  { value: "common.checkup", label: t("common.checkup") },
  { value: "common.new_patient", label: t('common.new_patient') },
  { value: "common.vaccination", label: t('common.vaccination') },
  { value: "common.surgery_consult", label: t('common.surgery_consult') },
  { value: "common.other", label: t('common.other') }
];

    // Prepare veterinarian options for ReactSelect
    const veterinarianOptions = veterinarians.map((vet: Veterinarian) => ({
        value: vet.uuid,
        label: `${vet.name}${vet.clinic ? ` - ${vet.clinic}` : ''}`,
    }));

    // Get selected veterinarian option
    const selectedVeterinarianOption = data.veterinary_id
        ? veterinarianOptions.find((opt: { value: string; label: string }) => opt.value === data.veterinary_id)
        : null;
    return (
       <MainLayout>
             <Page 
               title={t("common.metadata_titles.appointments_create")}
               description={t("common.page_descriptions.appointments_create") || "Create a new appointment by selecting a client, pet, appointment type, and scheduling date and time."}
             >
               <div className="transition-content px-(--margin-x) pb-6">
                 <div className="flex flex-col items-center justify-between space-y-4 py-5 sm:flex-row sm:space-y-0 lg:py-6">
                   <div className="flex items-center gap-1">
                     <div>
                       <Breadcrumbs items={breadcrumbs} className="max-sm:hidden" />
                       <p className="text-sm text-gray-500 dark:text-gray-400">
                         {t('common.new_appointment_description')}
                       </p>
                     </div>
                   </div>
                 </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-12 place-content-start gap-4 sm:gap-5 lg:gap-6">
                                  <div className="col-span-12">
                                    <Card className="p-4 sm:p-5 sm:px-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                            <div className="w-full">
                                <ReactSelect
                                    id="veterinary_id"
                                    label={t('common.veterinarian')}
                                    leftIcon={<UserIcon className="h-5 w-5" />}
                                    value={selectedVeterinarianOption}
                                    onChange={(option) => {
                                        if (option && !Array.isArray(option)) {
                                            setData('veterinary_id', option.value);
                                        } else {
                                            setData('veterinary_id', '');
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
                                {validationErrors.veterinary_id && <p className="text-red-500 text-sm mt-1">{validationErrors.veterinary_id}</p>}
                            </div>
                            <div className="w-full">
                                <label htmlFor="appointment_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('common.appointment_type')}
                                    <span className="text-red-500 mx-1">*</span>
                                </label>
<ReactSelect
                                                         id="appointment_type"
                                            value={
                                                data.appointment_type
                                                    ? {
                                                        value: data.appointment_type,
                                                        label: appointmentOptions?.find(appointment => appointment.value === data.appointment_type)?.label || ''
                                                    }
                                                    : null
                                            }
                                            onChange={(option) => {
                                                if (option && !Array.isArray(option)) {
                                                    setData('appointment_type', option.value);
                                                } else {
                                                    setData('appointment_type', '');
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
                                            className={errors?.appointment_type ? 'border-red-500' : ''}
                                            error={!!errors?.appointment_type}
                                            leftIcon={<CalendarCogIcon className="size-4.5" />}
                                            isRequired={true}
                                        />
                                        
                                {validationErrors.appointment_type && <p className="text-red-500 text-sm mt-1">{validationErrors.appointment_type}</p>}
                            </div>

                            <div className="w-full md:col-span-2">
                                <DatePicker
                                    selected={data.appointment_date && data.start_time ? new Date(`${data.appointment_date}T${data.start_time}`) : null}
                                    onChange={(dates: Date[]) => {
                                        if (dates && dates.length > 0) {
                                            const date = dates[0];
                                            const year = date.getFullYear();
                                            const month = String(date.getMonth() + 1).padStart(2, '0');
                                            const day = String(date.getDate()).padStart(2, '0');
                                            setData('appointment_date', `${year}-${month}-${day}`);
                                            setData('start_time', date.toTimeString().split(' ')[0].substring(0, 5));
                                        } else {
                                            setData('appointment_date', '');
                                            setData('start_time', '');
                                        }
                                    }}
                                    showTimeInput
                                     options={{
              enableTime: true,
              dateFormat: "Y-m-d H:i",
            }}
                                    placeholderText={t('common.select_date_and_time')}
                                    label={t('common.date_and_time')}
                                    className="rounded-xl"
                                    isRequired={true}
                                    prefix={<CalendarIcon className="size-4.5" />}
                                    min={minDate ? new Date(minDate) : new Date()}
                                />
                                {(validationErrors.appointment_date || validationErrors.start_time) && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {validationErrors.appointment_date || validationErrors.start_time}
                                    </p>
                                )}
                            </div>
                            <div className="w-full md:col-span-2">
                                <Input
                                    type="text"
                                    placeholder={t('common.reason_for_visit_placeholder')}
                                    label={t('common.reason_for_visit')}
                                    className="rounded-xl"
                                    prefix={<InformationCircleIcon className="size-4.5" />}
                                    value={data.reason_for_visit}
                                    onChange={(e) => setData('reason_for_visit', e.target.value)}
                                />
                                {validationErrors.reason_for_visit && <p className="text-red-500 text-sm mt-1">{validationErrors.reason_for_visit}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">

<div className="mt-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-600 rounded-lg border border-gray-200 dark:border-dark-500">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${data.is_video_conseil ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-200 dark:bg-dark-500'}`}>
                                {data.is_video_conseil ? (
                                  <VideoCameraIcon className="w-5 h-5 text-primary-600 dark:text-gray-400" />
                                ) : (
                                  <HomeIcon className="w-5 h-5 text-primary-600 dark:text-gray-400" />
                                )}
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-800 dark:text-dark-100">
                                  {data.is_video_conseil 
                                    ? t('common.vet_dashboard.form.online_consultation') || 'Online Consultation'
                                    : t('common.vet_dashboard.form.in_person_visit') || 'In-Person Visit'}
                                </label>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {data.is_video_conseil
                                    ? t('common.vet_dashboard.form.online_consultation_desc') || 'Video call appointment'
                                    : t('common.vet_dashboard.form.in_person_visit_desc') || 'Physical visit to clinic'}
                                </p>
                              </div>
                            </div>
                            <Switch
                              checked={data.is_video_conseil}
                              onChange={(e) => setData('is_video_conseil', e.target.checked)}
                              color="primary"
                              variant="basic"
                            />
                          </div>
                        </div>
                        <div className='mt-4'>
                            <label htmlFor="appointment_notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('common.appointment_notes')}</label>
                            <Textarea
                                                                        id="appointment_notes"
                                                                        value={data.appointment_notes || ''}
                                                                        onChange={(e) => setData('appointment_notes', e.target.value)}
                                                                        placeholder={t('common.appointment_notes_placeholder')}
                                                                        rows={3}
                                                                        className={errors?.appointment_notes ? 'border-red-500' : ''}
                                                                    />
                            {validationErrors.appointment_notes && <p className="text-red-500 text-sm mt-1">{validationErrors.appointment_notes}</p>}
                        </div>


                        </div>


                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 mt-6">
                            <Button
                                type="button"
                                variant="outlined"
                                onClick={() => router.get(route('appointments.index'))}
                                disabled={processing}
                                className="w-full sm:w-auto"
                            >
                                {t('common.cancel')}
                            </Button>
                            <Button
                                type="submit"
                                variant="filled"
                                disabled={processing}
                                color="primary"
                                className="w-full sm:w-auto"
                            >
                                {processing ? t('common.submitting') : t('common.request_appointment')}
                            </Button>
                        </div>
                    </Card>
                </div>
                </div>
                    </form>
                </div>
            </Page>
        </MainLayout>
    );
};

export default CreateAppointment;