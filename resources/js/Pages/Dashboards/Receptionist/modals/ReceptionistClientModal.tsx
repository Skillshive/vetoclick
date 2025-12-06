import React, { useEffect, useState } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { Button, Input } from '@/components/ui';
import { useToast } from '@/components/common/Toast/ToastContext';
import { BuildingOfficeIcon, EnvelopeIcon, MapIcon, PhoneArrowDownLeftIcon, UserIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { clientSchema, ClientFormData } from '@/schemas/clientSchema';
import { useTranslation } from '@/hooks/useTranslation';

// Declare route helper
declare const route: (name: string, params?: any, absolute?: boolean) => string;

interface ReceptionistClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onClientAdded: (client: { uuid: string; name: string }) => void;
}

export default function ReceptionistClientModal({ isOpen, onClose, onClientAdded }: ReceptionistClientModalProps) {
    const { showToast } = useToast();
    const { t } = useTranslation();
    const [validationErrors, setValidationErrors] = useState<Partial<Record<keyof ClientFormData, string>>>({});
    const [processing, setProcessing] = useState(false);
    const [formData, setFormData] = useState<ClientFormData>({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        fixe: '',
        address: '',
        city: '',
        postal_code: '',
    });

    useEffect(() => {
        if (!isOpen) {
            setFormData({
                first_name: '',
                last_name: '',
                email: '',
                phone: '',
                fixe: '',
                address: '',
                city: '',
                postal_code: '',
            });
            setValidationErrors({});
        }
    }, [isOpen]);

    // Real-time validation
    const validateField = (field: keyof ClientFormData, value: any) => {
        try {
            clientSchema.shape[field].parse(value);
            setValidationErrors(prev => ({ ...prev, [field]: undefined }));
        } catch (error: any) {
            if (error.errors) {
                const errorMessage = error.errors[0]?.message;
                setValidationErrors(prev => ({ ...prev, [field]: errorMessage }));
            }
        }
    };

    const handleFieldChange = (field: keyof ClientFormData, value: string) => {
        setFormData({ ...formData, [field]: value });
        validateField(field, value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const result = clientSchema.safeParse(formData);
        if (!result.success) {
            const fieldErrors = result.error.flatten().fieldErrors;
            const newErrors: Partial<Record<keyof ClientFormData, string>> = {};
            
            Object.keys(fieldErrors).forEach((key) => {
                const field = key as keyof ClientFormData;
                const errorMessages = fieldErrors[field];
                if (errorMessages && errorMessages.length > 0) {
                    newErrors[field] = errorMessages[0];
                }
            });
            
            setValidationErrors(newErrors);
            return;
        }

        setProcessing(true);
        try {
            const response = await fetch(route('clients.store'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const responseData = await response.json();
                
                showToast({
                    type: 'success',
                    message: t('common.client_created_success') || 'Client created successfully',
                    duration: 3000,
                });

                // Get the created client from the response
                if (responseData?.client) {
                    const newClient = {
                        uuid: responseData.client.uuid,
                        name: `${responseData.client.first_name} ${responseData.client.last_name}`,
                    };
                    onClientAdded(newClient);
                } else {
                    // Fallback: construct from form data (shouldn't happen if backend returns client)
                    const newClient = {
                        uuid: responseData?.uuid || '',
                        name: `${formData.first_name} ${formData.last_name}`,
                    };
                    if (newClient.uuid) {
                        onClientAdded(newClient);
                    }
                }

                setValidationErrors({});
                setFormData({
                    first_name: '',
                    last_name: '',
                    email: '',
                    phone: '',
                    fixe: '',
                    address: '',
                    city: '',
                    postal_code: '',
                });
                onClose();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create client');
            }
        } catch (error: any) {
            showToast({
                type: 'error',
                message: error.message || t('common.client_create_error') || 'Failed to create client',
                duration: 3000,
            });
        } finally {
            setProcessing(false);
        }
    };

    return (
        <Transition show={isOpen}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <TransitionChild
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/25 dark:bg-black/50" />
                </TransitionChild>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <TransitionChild
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <DialogPanel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-dark-700 p-6 text-left align-middle shadow-xl transition-all">
                                <DialogTitle className="flex items-center justify-between text-lg font-medium leading-6 text-gray-900 dark:text-dark-100">
                                    <span>
                                        {t('common.add_client')}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="rounded-md p-1 hover:bg-gray-100 dark:hover:bg-dark-600 transition-colors"
                                    >
                                        <XMarkIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                    </button>
                                </DialogTitle>

                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                                    {t('common.create_new_client')}
                                </p>
                                <form onSubmit={handleSubmit} className="mt-6">
                                    <div className="grid grid-cols-1 gap-4">
                                        {/* Name Fields */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                                    {t('common.first_name')}
                                                    <span className="text-red-500 mx-1">*</span>
                                                </label>
                                                <Input
                                                    type="text"
                                                    value={formData.first_name}
                                                    onChange={(e) => handleFieldChange('first_name', e.target.value)}
                                                    placeholder={t('common.first_name')}
                                                    className={validationErrors.first_name ? 'border-red-500' : ''}
                                                    leftIcon={<UserIcon className="size-4" />}
                                                />
                                                {validationErrors.first_name && (
                                                    <p className="mt-1 text-xs text-red-500">{t(validationErrors.first_name)}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                                    {t('common.last_name')}
                                                    <span className="text-red-500 mx-1">*</span>
                                                </label>
                                                <Input
                                                    type="text"
                                                    value={formData.last_name}
                                                    onChange={(e) => handleFieldChange('last_name', e.target.value)}
                                                    placeholder={t('common.last_name')}
                                                    className={validationErrors.last_name ? 'border-red-500' : ''}
                                                    leftIcon={<UserIcon className="size-4" />}
                                                />
                                                {validationErrors.last_name && (
                                                    <p className="mt-1 text-xs text-red-500">{t(validationErrors.last_name)}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Contact Fields */}
                                        <div className="grid grid-cols-2 gap-4">
                                        <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                                    {t('common.phone')}
                                                    <span className="text-red-500 mx-1">*</span>
                                                </label>
                                                <Input
                                                    type="tel"
                                                    value={formData.phone}
                                                    onChange={(e) => handleFieldChange('phone', e.target.value)}
                                                    placeholder={t('common.phone')}
                                                    className={validationErrors.phone ? 'border-red-500' : ''}
                                                    leftIcon={<PhoneArrowDownLeftIcon className="size-4" />}
                                                />
                                                {validationErrors.phone && (
                                                    <p className="mt-1 text-xs text-red-500">{t(validationErrors.phone)}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                                    {t('common.email')}
                                                </label>
                                                <Input
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={(e) => handleFieldChange('email', e.target.value)}
                                                    placeholder={t('common.email')}
                                                    className={validationErrors.email ? 'border-red-500' : ''}
                                                    leftIcon={<EnvelopeIcon className="size-4" />}
                                                />
                                                {validationErrors.email && (
                                                    <p className="mt-1 text-xs text-red-500">{t(validationErrors.email)}</p>
                                                )}
                                            </div>
                                            
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                                {t('common.fixe') || 'Fixed Line'}
                                            </label>
                                            <Input
                                                type="tel"
                                                value={formData.fixe}
                                                onChange={(e) => handleFieldChange('fixe', e.target.value)}
                                                placeholder={t('common.fixe') || 'Fixed line'}
                                                className={validationErrors.fixe ? 'border-red-500' : ''}
                                                leftIcon={<PhoneArrowDownLeftIcon className="size-4" />}
                                            />
                                            {validationErrors.fixe && (
                                                <p className="mt-1 text-xs text-red-500">{t(validationErrors.fixe)}</p>
                                            )}
                                        </div>

                                        {/* Address Fields */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                                {t('common.address')}
                                            </label>
                                            <Input
                                                type="text"
                                                value={formData.address}
                                                onChange={(e) => handleFieldChange('address', e.target.value)}
                                                placeholder={t('common.address')}
                                                className={validationErrors.address ? 'border-red-500' : ''}
                                                leftIcon={<MapIcon className="size-4" />}
                                                />
                                            {validationErrors.address && (
                                                <p className="mt-1 text-xs text-red-500">{t(validationErrors.address)}</p>
                                            )}
                                        </div>
                                        </div>


                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                                    {t('common.city')}
                                                </label>
                                                <Input
                                                    type="text"
                                                    value={formData.city}
                                                    onChange={(e) => handleFieldChange('city', e.target.value)}
                                                    placeholder={t('common.city')}
                                                    className={validationErrors.city ? 'border-red-500' : ''}
                                                    leftIcon={<MapIcon className="size-4" />}
                                                />
                                                {validationErrors.city && (
                                                    <p className="mt-1 text-xs text-red-500">{t(validationErrors.city)}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                                    {t('common.postal_code')}
                                                </label>
                                                <Input
                                                    type="text"
                                                    value={formData.postal_code}
                                                    onChange={(e) => handleFieldChange('postal_code', e.target.value)}
                                                    placeholder={t('common.postal_code')}
                                                    className={validationErrors.postal_code ? 'border-red-500' : ''}
                                                    leftIcon={<BuildingOfficeIcon className="size-4" />}
                                                />
                                                {validationErrors.postal_code && (
                                                    <p className="mt-1 text-xs text-red-500">{t(validationErrors.postal_code)}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex justify-end gap-3">
                                        <Button
                                            type="button"
                                            variant="outlined"
                                            onClick={onClose}
                                            disabled={processing}
                                        >
                                            {t('common.cancel')}
                                        </Button>
                                        <Button
                                            type="submit"
                                            color="primary"
                                            disabled={processing}
                                        >
                                            {processing ? t('common.saving') : t('common.save')}
                                        </Button>
                                    </div>
                                </form>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}

