import React, { useState, useEffect } from 'react';
import { router, useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import { Button, Input, Textarea, Switch } from '@/components/ui';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/common/Toast/ToastContext';
import { appointmentSchema, AppointmentFormValues } from '@/schemas/appointmentSchema';
import { useTranslation } from '@/hooks/useTranslation';
import { CalendarIcon, ClockIcon, InformationCircleIcon, VideoCameraIcon, HomeIcon } from '@heroicons/react/24/outline';
import { DatePicker } from '@/components/shared/form/Datepicker';
import ReactSelect from '@/components/ui/ReactSelect';
import { CalendarCogIcon } from 'lucide-react';
import { HeartIcon, UserIcon } from '@heroicons/react/24/outline';

// Declare route helper
declare const route: (name: string, params?: any, absolute?: boolean) => string;

interface Pet {
  uuid: string;
  name: string;
}

interface Veterinarian {
  uuid: string;
  name: string;
  clinic_name?: string;
  specialization?: string;
}

interface AppointmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialVideoConsultation?: boolean;
}

export const AppointmentFormModal: React.FC<AppointmentFormModalProps> = ({ isOpen, onClose, initialVideoConsultation = false }) => {
    const { showToast } = useToast();
    const { t } = useTranslation();
    const { props } = usePage();
    const [validationErrors, setValidationErrors] = useState<Partial<Record<keyof AppointmentFormValues, string>>>({});
    const [pets, setPets] = useState<Pet[]>([]);
    const [loadingPets, setLoadingPets] = useState(false);
    const [veterinarians, setVeterinarians] = useState<Veterinarian[]>([]);
    const [loadingVets, setLoadingVets] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm<AppointmentFormValues>({
        appointment_type: '',
        appointment_date: '',
        start_time: '',
        is_video_conseil: initialVideoConsultation,
        reason_for_visit: '',
        appointment_notes: '',
        veterinary_id: '',
        pet_id: '',
    });

    // Fetch pets and veterinarians when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchPets();
            fetchVeterinarians();
            // Set video consultation state when modal opens
            setData('is_video_conseil', initialVideoConsultation);
        }
    }, [isOpen, initialVideoConsultation]);

    const fetchVeterinarians = async () => {
        try {
            setLoadingVets(true);
            const response = await axios.get(route('veterinarians.all'));
            setVeterinarians(response.data || []);
        } catch (error) {
            console.error('Error fetching veterinarians:', error);
            showToast({
                type: 'error',
                message: t('common.error_fetching_veterinarians') || 'Error fetching veterinarians',
                duration: 3000,
            });
        } finally {
            setLoadingVets(false);
        }
    };

    const fetchPets = async () => {
        try {
            setLoadingPets(true);
            // Get client from props or user
            const client = (props as any)?.client;
            if (client?.uuid) {
                const response = await axios.get(route('clients.pets', { uuid: client.uuid }));
                setPets(response.data || []);
            }
        } catch (error) {
            console.error('Error fetching pets:', error);
            showToast({
                type: 'error',
                message: t('common.error_fetching_pets') || 'Error fetching pets',
                duration: 3000,
            });
        } finally {
            setLoadingPets(false);
        }
    };

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

        post(route('appointments.request'), {
            onSuccess: () => {
                showToast({
                    type: 'success',
                    message: t('common.appointment_created_success'),
                    duration: 3000,
                });
                reset();
                setValidationErrors({});
                onClose();
                router.visit(route('user.dashboard'), { only: ['appointments'] });
            },
            onError: (errors: Record<string, string>) => {
                const newErrors: Partial<Record<keyof AppointmentFormValues, string>> = {};
                for (const key in errors) {
                    const schemaKeys = Object.keys(appointmentSchema.shape);
                    if (schemaKeys.includes(key)) {
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

    const handleClose = () => {
        reset();
        setValidationErrors({});
        setPets([]);
        setVeterinarians([]);
        onClose();
    };

    const appointmentOptions = [
        { value: "common.checkup", label: t("common.checkup") },
        { value: "common.new_patient", label: t('common.new_patient') },
        { value: "common.vaccination", label: t('common.vaccination') },
        { value: "common.surgery_consult", label: t('common.surgery_consult') },
        { value: "common.other", label: t('common.other') }
    ];

    const modalActions = (
        <>
            <Button
                type="button"
                variant="outlined"
                onClick={handleClose}
                disabled={processing}
            >
                {t('common.cancel')}
            </Button>
            <Button
                type="submit"
                variant="filled"
                disabled={processing}
                color="primary"
                form="appointment-form"
            >
                {processing ? t('common.submitting') : t('common.request_appointment')}
            </Button>
        </>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={t("common.new_appointment")}
            actions={modalActions}
        >
            <form id="appointment-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label htmlFor="veterinary_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            {t('common.veterinarian') || 'Veterinarian'}
                            <span className="text-red-500 mx-1">*</span>
                        </label>
                        <ReactSelect
                            id="veterinary_id"
                            value={
                                data.veterinary_id
                                    ? {
                                        value: data.veterinary_id,
                                        label: veterinarians.find(vet => vet.uuid === data.veterinary_id)?.name || ''
                                    }
                                    : null
                            }
                            onChange={(option) => {
                                if (option && !Array.isArray(option)) {
                                    setData('veterinary_id', option.value);
                                } else {
                                    setData('veterinary_id', '');
                                }
                            }}
                            options={veterinarians.map((vet) => ({
                                value: vet.uuid,
                                label: vet.clinic_name ? `${vet.name} - ${vet.clinic_name}` : vet.name
                            }))}
                            placeholder={loadingVets ? t('common.loading') || 'Loading...' : (t('common.select_veterinarian') || 'Select Veterinarian')}
                            className={errors?.veterinary_id ? 'border-red-500' : ''}
                            error={!!errors?.veterinary_id}
                            leftIcon={<UserIcon className="size-4.5" />}
                            isRequired={true}
                            isDisabled={loadingVets}
                        />
                        {validationErrors.veterinary_id && <p className="text-red-500 text-sm mt-1">{validationErrors.veterinary_id}</p>}
                    </div>

                    <div>
                        <label htmlFor="appointment_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            {t('common.appointment_type')}
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

                    <div>
                        <DatePicker
                            selected={data.appointment_date && data.start_time ? new Date(`${data.appointment_date}T${data.start_time}`) : null}
                            onChange={(dates: Date[]) => {
                                if (dates && dates.length > 0) {
                                    const date = dates[0];
                                    setData('appointment_date', date.toISOString().split('T')[0]);
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
                                minDate: new Date(),
                            }}
                            placeholderText={t('common.select_date_and_time')}
                            label={t('common.date_and_time')}
                            className="rounded-xl"
                            required
                            prefix={<CalendarIcon className="size-4.5" />}
                        />
                        {(validationErrors.appointment_date || validationErrors.start_time) && (
                            <p className="text-red-500 text-sm mt-1">
                                {validationErrors.appointment_date || validationErrors.start_time}
                            </p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="pet_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            {t('common.pet') || 'Pet'}
                            <span className="text-red-500 mx-1">*</span>
                        </label>
                        <ReactSelect
                            id="pet_id"
                            value={
                                data.pet_id
                                    ? {
                                        value: data.pet_id,
                                        label: pets.find(pet => pet.uuid === data.pet_id)?.name || ''
                                    }
                                    : null
                            }
                            onChange={(option) => {
                                if (option && !Array.isArray(option)) {
                                    setData('pet_id', option.value);
                                } else {
                                    setData('pet_id', '');
                                }
                            }}
                            options={pets.map((pet) => ({
                                value: pet.uuid,
                                label: pet.name
                            }))}
                            placeholder={loadingPets ? t('common.loading') || 'Loading...' : (t('common.select_pet') || 'Select Pet')}
                            className={errors?.pet_id ? 'border-red-500' : ''}
                            error={!!errors?.pet_id}
                            leftIcon={<HeartIcon className="size-4.5" />}
                            isRequired={true}
                            isDisabled={loadingPets}
                        />
                        {validationErrors.pet_id && <p className="text-red-500 text-sm mt-1">{validationErrors.pet_id}</p>}
                    </div>

                    <div>
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

                    <div>
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

                    <div>
                        <label htmlFor="appointment_notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            {t('common.appointment_notes')}
                        </label>
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
            </form>
        </Modal>
    );
};

